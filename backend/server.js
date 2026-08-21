import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || process.env.TOKEN_SECRET || "change-this-secret";
const FRESHDESK_DOMAIN = (process.env.FRESHDESK_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const FRESHDESK_API_KEY = process.env.FRESHDESK_API_KEY || "";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");

function readUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    company: user.company || "",
    companyId: user.companyId || null,
    title: user.title || "",
    contactId: user.contactId || null,
    role: "customer"
  };
}
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });
}
function requireCustomer(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = readUsers().find((item) => item.id === payload.id);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.customerUser = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const hasFreshdesk = Boolean(FRESHDESK_DOMAIN && FRESHDESK_API_KEY);
function assertFreshdesk() {
  if (!hasFreshdesk) throw new Error("Freshdesk credentials are not configured");
}
async function freshdesk(resource, options = {}) {
  assertFreshdesk();
  const response = await fetch(`https://${FRESHDESK_DOMAIN}/api/v2${resource}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${FRESHDESK_API_KEY}:X`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (response.status === 204) return null;
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const message = data?.description || data?.message || data?.errors?.[0]?.message || text || "Freshdesk request failed";
    const error = new Error(`Freshdesk ${response.status}: ${message}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
async function freshdeskAll(resource) {
  const all = [];
  for (let page = 1; page <= 100; page += 1) {
    const join = resource.includes("?") ? "&" : "?";
    const batch = await freshdesk(`${resource}${join}page=${page}&per_page=100`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

app.get("/api/health", (req, res) => res.json({ ok: true, freshdeskConfigured: hasFreshdesk }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, fullName, email, password, phone, company, title } = req.body || {};
    const cleanName = String(name || fullName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanName) return res.status(400).json({ error: "Full name is required" });
    if (!cleanEmail) return res.status(400).json({ error: "Email is required" });
    if (!password || String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const users = readUsers();
    if (users.some((u) => String(u.email).toLowerCase() === cleanEmail)) return res.status(409).json({ error: "An account with this email already exists" });

    let contactId = null;
    let companyId = null;
    let contactName = cleanName;
    if (hasFreshdesk) {
      const contacts = await freshdeskAll("/contacts");
      let contact = contacts.find((item) => String(item.email || "").trim().toLowerCase() === cleanEmail);
      let companyRecord = null;
      const cleanCompany = String(company || "").trim();
      if (cleanCompany) {
        const companies = await freshdeskAll("/companies");
        companyRecord = companies.find((item) => String(item.name || "").trim().toLowerCase() === cleanCompany.toLowerCase());
        if (!companyRecord) companyRecord = await freshdesk("/companies", { method: "POST", body: JSON.stringify({ name: cleanCompany }) });
        companyId = Number(companyRecord.id);
      }
      const customerData = { name: cleanName, email: cleanEmail };
      if (String(phone || "").trim()) customerData.phone = String(phone).trim();
      if (String(title || "").trim()) customerData.job_title = String(title).trim();
      if (companyId) customerData.company_id = companyId;
      contact = contact
        ? await freshdesk(`/contacts/${contact.id}`, { method: "PUT", body: JSON.stringify(customerData) })
        : await freshdesk("/contacts", { method: "POST", body: JSON.stringify(customerData) });
      contactId = Number(contact.id);
      contactName = contact.name || cleanName;
      companyId = companyId || (contact.company_id ? Number(contact.company_id) : null);
    }

    const user = {
      id: crypto.randomUUID(), name: contactName, email: cleanEmail,
      phone: String(phone || "").trim(), company: String(company || "").trim(), title: String(title || "").trim(),
      contactId, companyId, passwordHash: await bcrypt.hash(String(password), 10), createdAt: new Date().toISOString()
    };
    users.push(user); writeUsers(users);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(error.status && error.status < 500 ? 502 : 500).json({ error: "Unable to create customer account", detail: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = readUsers().find((item) => String(item.email).toLowerCase() === email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const hash = user.passwordHash || user.password;
    if (!(await bcrypt.compare(password, hash))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { res.status(500).json({ error: "Login failed", detail: error.message }); }
});

app.get("/api/auth/me", requireCustomer, (req, res) => res.json({ user: publicUser(req.customerUser) }));
app.post("/api/auth/logout", (req, res) => res.json({ ok: true }));

app.get("/api/customer/tickets", requireCustomer, async (req, res) => {
  try {
    if (!req.customerUser.contactId) return res.json([]);
    const tickets = await freshdeskAll("/tickets");
    res.json(tickets.filter((ticket) => Number(ticket.requester_id) === Number(req.customerUser.contactId)));
  } catch (error) { res.status(502).json({ error: "Unable to load your tickets", detail: error.message }); }
});

app.post("/api/customer/tickets", requireCustomer, async (req, res) => {
  try {
    const { subject, description, priority = 2, status = 2, type } = req.body || {};
    if (!String(subject || "").trim() || !String(description || "").trim()) return res.status(400).json({ error: "Ticket subject and description are required" });
    if (!req.customerUser.contactId) return res.status(400).json({ error: "This customer account is not linked to a Freshdesk contact" });
    const body = { subject: String(subject).trim(), description: String(description).trim(), priority: Number(priority), status: Number(status), requester_id: Number(req.customerUser.contactId) };
    if (type) body.type = type;
    const ticket = await freshdesk("/tickets", { method: "POST", body: JSON.stringify(body) });
    res.status(201).json(ticket);
  } catch (error) { res.status(502).json({ error: "Unable to create ticket", detail: error.message }); }
});

app.get("/api/tickets", async (req, res) => {
  try { res.json(await freshdeskAll("/tickets")); }
  catch (error) { res.status(502).json({ error: "Unable to load Freshdesk tickets", detail: error.message }); }
});
app.get("/api/customers", async (req, res) => {
  try { res.json(await freshdeskAll("/contacts")); }
  catch (error) { res.status(502).json({ error: "Unable to load Freshdesk customers", detail: error.message }); }
});
app.get("/api/companies", async (req, res) => {
  try { res.json(await freshdeskAll("/companies")); }
  catch (error) { res.status(502).json({ error: "Unable to load Freshdesk companies", detail: error.message }); }
});
app.get("/api/agents", async (req, res) => {
  try { res.json(await freshdeskAll("/agents")); }
  catch (error) { res.status(502).json({ error: "Unable to load Freshdesk agents", detail: error.message }); }
});
app.get("/api/dashboard", async (req, res) => {
  try {
    const tickets = await freshdeskAll("/tickets");

    const statusName = (status) => {
      const statuses = {
        2: "Open",
        3: "Pending",
        4: "Resolved",
        5: "Closed"
      };

      return statuses[Number(status)] || "Unknown";
    };

    const priorityName = (priority) => {
      const priorities = {
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Urgent"
      };

      return priorities[Number(priority)] || "Low";
    };

    const openTickets = tickets.filter(
      (ticket) => Number(ticket.status) === 2
    );

    const pendingTickets = tickets.filter(
      (ticket) => Number(ticket.status) === 3
    );

    const resolvedTickets = tickets.filter(
      (ticket) => Number(ticket.status) === 4
    );

    const highPriorityTickets = tickets.filter(
      (ticket) =>
        Number(ticket.priority) === 3 ||
        Number(ticket.priority) === 4
    );

    const recentTickets = [...tickets]
      .sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, 8)
      .map((ticket) => [
        `#FD-${ticket.id}`,
        ticket.subject || "Untitled ticket",
        ticket.requester_id
          ? `Customer #${ticket.requester_id}`
          : "Unknown customer",
        statusName(ticket.status),
        ticket.created_at
          ? new Date(ticket.created_at).toLocaleString()
          : ""
      ]);

    const highPriority = highPriorityTickets
      .sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, 8)
      .map((ticket) => [
        `#FD-${ticket.id}`,
        ticket.subject || "Untitled ticket",
        ticket.requester_id
          ? `Customer #${ticket.requester_id}`
          : "Unknown customer",
        priorityName(ticket.priority),
        ticket.created_at
          ? new Date(ticket.created_at).toLocaleString()
          : ""
      ]);

    res.json({
      stats: [
        ["ticket", "Total Tickets", tickets.length, "", "blue"],
        ["folder", "Open", openTickets.length, "", "green"],
        ["clock", "Pending", pendingTickets.length, "", "yellow"],
        ["check-circle", "Resolved", resolvedTickets.length, "", "purple"]
      ],

      recentTickets,

      highPriority,

      totalTickets: tickets.length,
      openTickets: openTickets.length,
      pendingTickets: pendingTickets.length,
      resolvedTickets: resolvedTickets.length
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(502).json({
      error: "Dashboard request failed",
      detail: error.message
    });
  }
});

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));
app.listen(PORT, () => {
  console.log(`Backjobs API running at http://localhost:${PORT}`);
  console.log(hasFreshdesk ? "Freshdesk integration enabled." : "Freshdesk integration not configured.");
});
