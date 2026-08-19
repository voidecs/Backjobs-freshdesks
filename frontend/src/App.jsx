import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   ICONS
   ========================================================= */

function Icon({ name, size = 19 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    ticket: (
      <>
        <path d="M4 5h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6Z" />
        <path d="M12 5v2M12 17v2M12 11v2" />
      </>
    ),

    building: (
      <>
        <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
        <path d="M2 21h20" />
        <path d="M8 7h4M8 11h4M8 15h4" />
        <path d="M17 9h3v12" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    alert: (
      <>
        <path d="M12 3 2.5 20h19L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.3 8.3-8 10-4.7-1.7-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    chevron: <path d="m7 10 5 5 5-5" />,

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" />
      </>
    ),

    switch: (
      <>
        <path d="M17 3l4 4-4 4M3 7h18" />
        <path d="M7 21l-4-4 4-4M21 17H3" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    )
  };

  return (
    <svg {...common}>
      {icons[name] || icons.dashboard}
    </svg>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function getStatus(status) {
  const map = {
    2: "Open",
    3: "Pending",
    4: "Resolved",
    5: "Closed"
  };

  return map[Number(status)] || "Unknown";
}

function getPriority(priority) {
  const map = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent"
  };

  return map[Number(priority)] || "Normal";
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/dashboard`
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard request failed (${response.status})`
        );
      }

      const result = await response.json();

      setData(result);

    } catch (err) {
      setError(
        err.message ||
        "Unable to load Freshdesk dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-state">
        <h1>Dashboard</h1>
        <p>Loading live Freshdesk data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state">
        <h1>Dashboard</h1>

        <p className="error-text">
          {error}
        </p>

        <button
          className="primary-btn"
          onClick={loadDashboard}
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || [];
  const recentTickets =
    data?.recentTickets || [];

  const highPriority =
    data?.highPriority || [];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>

          <p>
            Live overview of your Freshdesk
            support system.
          </p>
        </div>

        <button
          className="icon-control"
          onClick={loadDashboard}
          title="Refresh"
        >
          <Icon name="refresh" size={17} />
        </button>
      </div>

      <div className="stats">
        {stats.map((item, index) => (
          <div
            className="stat-card"
            key={index}
          >
            <div
              className={`stat-icon ${
                item[4] || ""
              }`}
            >
              <Icon
                name={item[0]}
                size={20}
              />
            </div>

            <div className="stat-info">
              <span>{item[1]}</span>

              <strong>
                {item[2] ?? "—"}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Recent Tickets</h2>

            <p>
              Latest tickets from Freshdesk.
            </p>
          </div>
        </div>

        <div className="manager-ticket-list">
          {recentTickets.length ? (
            recentTickets.map(
              (
                [
                  id,
                  subject,
                  customer,
                  status,
                  time
                ]
              ) => (
                <div
                  className="manager-ticket-row"
                  key={id}
                >
                  <span className="manager-ticket-id">
                    {id}
                  </span>

                  <span className="manager-ticket-main">
                    <strong>
                      {subject}
                    </strong>

                    <small>
                      {customer}
                    </small>
                  </span>

                  <span
                    className={`manager-status ${
                      String(status)
                        .toLowerCase()
                    }`}
                  >
                    {status}
                  </span>

                  <small>
                    {time}
                  </small>
                </div>
              )
            )
          ) : (
            <div className="empty">
              No Freshdesk tickets found.
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>High Priority Tickets</h2>

            <p>
              Tickets requiring attention.
            </p>
          </div>
        </div>

        <div className="manager-ticket-list">
          {highPriority.length ? (
            highPriority.map(
              (
                [
                  id,
                  subject,
                  customer,
                  priority,
                  time
                ]
              ) => (
                <div
                  className="manager-ticket-row"
                  key={id}
                >
                  <span className="manager-ticket-id">
                    {id}
                  </span>

                  <span className="manager-ticket-main">
                    <strong>
                      {subject}
                    </strong>

                    <small>
                      {customer}
                    </small>
                  </span>

                  <span
                    className={`badge ${
                      String(priority)
                        .toLowerCase()
                    }`}
                  >
                    {priority}
                  </span>

                  <small>
                    {time}
                  </small>
                </div>
              )
            )
          ) : (
            <div className="empty">
              No high priority tickets.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   MANAGER TICKETS
   ========================================================= */

function ManagerTickets() {
  const [tickets, setTickets] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selected, setSelected] =
    useState(null);

  const [conversations, setConversations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/tickets`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load Freshdesk tickets"
        );
      }

      const result =
        await response.json();

      setTickets(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (err) {
      setError(
        err.message ||
        "Unable to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTicket = async (ticket) => {
    setSelected(ticket);
    setConversations([]);

    try {
      const response = await fetch(
        `${API_BASE}/tickets/${ticket.id}/conversations`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load conversation"
        );
      }

      const result =
        await response.json();

      setConversations(
        Array.isArray(result)
          ? result
          : []
      );

    } catch (err) {
      setConversations([]);
    }
  };

  const filteredTickets =
    tickets.filter((ticket) => {
      const query =
        search.toLowerCase();

      const searchable = [
        ticket.id,
        ticket.subject,
        ticket.email,
        ticket.description_text
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchable.includes(query);

      const status =
        getStatus(ticket.status);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Tickets</h1>

          <p>
            Manage live Freshdesk tickets.
          </p>
        </div>

        <button
          className="icon-control"
          onClick={loadTickets}
        >
          <Icon
            name="refresh"
            size={17}
          />
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="panel">
        <div className="manager-ticket-toolbar">

          <div className="lead-search">
            <Icon
              name="search"
              size={18}
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search tickets..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option>All</option>
            <option>Open</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

        </div>

        {loading ? (
          <div className="empty">
            Loading Freshdesk tickets...
          </div>
        ) : (
          <div className="manager-ticket-list">

            {filteredTickets.map(
              (ticket) => {
                const status =
                  getStatus(
                    ticket.status
                  );

                const priority =
                  getPriority(
                    ticket.priority
                  );

                return (
                  <button
                    className="manager-ticket-row"
                    key={ticket.id}
                    onClick={() =>
                      openTicket(ticket)
                    }
                  >
                    <span className="manager-ticket-id">
                      #FD-{ticket.id}
                    </span>

                    <span className="manager-ticket-main">
                      <strong>
                        {ticket.subject ||
                          "Untitled ticket"}
                      </strong>

                      <small>
                        {ticket.email ||
                          `Customer #${ticket.requester_id}`}
                      </small>
                    </span>

                    <span
                      className={`badge ${
                        priority.toLowerCase()
                      }`}
                    >
                      {priority}
                    </span>

                    <span
                      className={`manager-status ${
                        status.toLowerCase()
                      }`}
                    >
                      {status}
                    </span>
                  </button>
                );
              }
            )}

            {!filteredTickets.length && (
              <div className="empty">
                No Freshdesk tickets found.
              </div>
            )}

          </div>
        )}
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelected(null);
            }
          }}
        >
          <div className="modal ticket-detail-modal">

            <div className="modal-head">
              <div>
                <span className="manager-ticket-id">
                  #FD-{selected.id}
                </span>

                <h2>
                  {selected.subject ||
                    "Untitled ticket"}
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>
            </div>

            {selected.description_text && (
              <div className="manager-conversation">
                <h3>Description</h3>

                <p>
                  {selected.description_text}
                </p>
              </div>
            )}

            <div className="manager-conversation">
              <h3>Conversation</h3>

              {conversations.length ? (
                conversations.map(
                  (message) => (
                    <div
                      className="manager-message"
                      key={message.id}
                    >
                      <div className="message-avatar">
                        {message.incoming
                          ? "C"
                          : "B"}
                      </div>

                      <div>
                        <strong>
                          {message.incoming
                            ? "Customer"
                            : "BACKJOBS Support"}
                        </strong>

                        <p
                          dangerouslySetInnerHTML={{
                            __html:
                              message.body ||
                              message.body_text ||
                              ""
                          }}
                        />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="empty">
                  No conversation messages.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMERS MANAGER PAGE
   ========================================================= */

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_id: "",
  });

  // Text shown in the company input
  const [companyText, setCompanyText] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersResponse, companiesResponse] =
        await Promise.all([
          fetch(`${API_BASE}/customers`),
          fetch(`${API_BASE}/companies`),
        ]);

      if (!customersResponse.ok) {
        throw new Error("Unable to load Freshdesk customers");
      }

      const customerData = await customersResponse.json();

      setCustomers(
        Array.isArray(customerData) ? customerData : []
      );

      if (companiesResponse.ok) {
        const companyData = await companiesResponse.json();

        setCompanies(
          Array.isArray(companyData) ? companyData : []
        );
      } else {
        setCompanies([]);
      }
    } catch (err) {
      setError(
        err.message || "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      company_id: "",
    });

    setCompanyText("");
  };

  // Finds the company ID when the user types/selects a company
  const handleCompanyChange = (value) => {
    setCompanyText(value);

    const selectedCompany = companies.find(
      (company) =>
        company.name.toLowerCase() ===
        value.trim().toLowerCase()
    );

    setForm((current) => ({
      ...current,
      company_id: selectedCompany
        ? String(selectedCompany.id)
        : "",
    }));
  };

  const createCustomer = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError(
        "Customer name and email are required."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/customers`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),

            phone:
              form.phone.trim() || undefined,

            company_id: form.company_id
              ? Number(form.company_id)
              : undefined,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.detail ||
            result.error ||
            "Unable to create customer"
        );
      }

      resetForm();

      setShowForm(false);

      await loadCustomers();
    } catch (err) {
      setError(
        err.message ||
          "Unable to create customer"
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) => {
      const query = search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return [
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    }
  );

  const getCompanyName = (companyId) => {
    if (!companyId) {
      return "No company";
    }

    const company = companies.find(
      (item) =>
        Number(item.id) === Number(companyId)
    );

    return (
      company?.name ||
      `Company #${companyId}`
    );
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Customers</h1>

          <p>
            Manage real Freshdesk customers.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setError("");
            resetForm();
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={17} />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="panel">
        <div className="manager-ticket-toolbar">
          <div className="lead-search">
            <Icon name="search" size={18} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customers..."
            />
          </div>

          <button
            className="icon-control"
            onClick={loadCustomers}
            title="Refresh customers"
          >
            <Icon name="refresh" size={17} />
          </button>
        </div>

        {loading ? (
          <div className="empty">
            Loading Freshdesk customers...
          </div>
        ) : (
          <div className="manager-ticket-list">
            {filteredCustomers.map(
              (customer) => (
                <div
                  className="manager-ticket-row"
                  key={customer.id}
                >
                  <div className="message-avatar">
                    {(
                      customer.name ||
                      customer.email ||
                      "C"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="manager-ticket-main">
                    <strong>
                      {customer.name ||
                        "Unnamed customer"}
                    </strong>

                    <small>
                      {customer.email ||
                        "No email"}
                    </small>
                  </span>

                  <span>
                    <small>
                      {customer.phone ||
                        "No phone"}
                    </small>
                  </span>

                  <span>
                    <small>
                      {getCompanyName(
                        customer.company_id
                      )}
                    </small>
                  </span>
                </div>
              )
            )}

            {!filteredCustomers.length && (
              <div className="empty">
                No Freshdesk customers found.
              </div>
            )}
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              resetForm();
              setShowForm(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <h2>Add Customer</h2>

                <p>
                  This will create a real customer
                  in Freshdesk.
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                ×
              </button>
            </div>

            <form
              className="customer-form"
              onSubmit={createCustomer}
            >
              <label>
                Full Name

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                  required
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@email.com"
                  required
                />
              </label>

              <label>
                Phone

                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Optional phone number"
                />
              </label>

              <label>
                Company

                {/* TYPE OR SELECT COMPANY */}
                <input
                  type="text"
                  list="freshdesk-company-options"
                  value={companyText}
                  onChange={(e) =>
                    handleCompanyChange(
                      e.target.value
                    )
                  }
                  placeholder="Type or select a company (optional)"
                />

                <datalist id="freshdesk-company-options">
                  {companies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.name}
                      />
                    )
                  )}
                </datalist>

                {companyText &&
                  !form.company_id && (
                    <small className="field-hint">
                      Select an existing company
                      from the suggestions, or clear
                      this field for no company.
                    </small>
                  )}
              </label>

              <button
                className="customer-primary"
                type="submit"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
/* =========================================================
   CUSTOMER PORTAL
   ========================================================= */

function CustomerPortal({ onSwitchManager }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("backjobs_customer_token") || ""
  );
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: ""
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [view, setView] = useState("Home");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "",
    priority: "2",
    description: ""
  });

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const api = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail || data.error || "Request failed"
      );
    }

    return data;
  };

  const loadTickets = async () => {
    if (!token) return;

    try {
      setTicketLoading(true);
      setError("");

      const data = await api("/customer/tickets");
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      if (/unauthorized|expired|invalid/i.test(err.message)) {
        localStorage.removeItem("backjobs_customer_token");
        setToken("");
        setUser(null);
      } else {
        setError(err.message || "Unable to load your tickets.");
      }
    } finally {
      setTicketLoading(false);
    }
  };

  const loadSession = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await api("/auth/me");
      setUser(data.user);
      await loadTickets();
    } catch (err) {
      localStorage.removeItem("backjobs_customer_token");
      setToken("");
      setUser(null);
      setAuthError(
        err.message || "Your session has expired. Please sign in again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [token]);

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Email and password are required.");
      return;
    }

    if (
      authMode === "register" &&
      !authForm.name.trim()
    ) {
      setAuthError("Full name is required.");
      return;
    }

    try {
      setAuthLoading(true);

      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/register";

      const body =
        authMode === "login"
          ? {
              email: authForm.email.trim(),
              password: authForm.password
            }
          : {
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
              phone: authForm.phone.trim(),
              company: authForm.company.trim()
            };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.detail || result.error || "Authentication failed"
        );
      }

      localStorage.setItem(
        "backjobs_customer_token",
        result.token
      );

      setUser(result.user);
      setToken(result.token);
      setAuthForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        company: ""
      });
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("backjobs_customer_token");
    setToken("");
    setUser(null);
    setTickets([]);
    setSelectedTicket(null);
    setView("Home");
  };

  const submitTicket = async (e) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      setError("Ticket subject and description are required.");
      return;
    }

    try {
      setError("");

      const ticket = await api("/customer/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: form.subject.trim(),
          description: form.description.trim(),
          priority: Number(form.priority),
          status: 2,
          type: form.category || undefined
        })
      });

      setTickets((current) => [ticket, ...current]);

      setForm({
        subject: "",
        category: "",
        priority: "2",
        description: ""
      });

      setView("My Tickets");
    } catch (err) {
      setError(err.message || "Unable to create ticket.");
    }
  };

  const statusName = (status) => ({
    2: "Open",
    3: "Pending",
    4: "Resolved",
    5: "Closed"
  }[Number(status)] || "Unknown");

  const priorityName = (priority) => ({
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent"
  }[Number(priority)] || "Normal");

  const openCount = tickets.filter(
    (ticket) => Number(ticket.status) === 2
  ).length;

  const pendingCount = tickets.filter(
    (ticket) => Number(ticket.status) === 3
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => Number(ticket.status) === 4
  ).length;

  if (!token || (!user && !loading)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#080d13"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#121922",
            border: "1px solid #2b3745",
            borderRadius: 16,
            padding: 28,
            boxShadow: "0 20px 60px rgba(0,0,0,.35)"
          }}
        >
          <div className="brand" style={{ marginBottom: 24 }}>
            <div className="brand-mark">B</div>
            <div>
              <div className="brand-name">BACKJOBS</div>
              <div className="brand-tag">
                CUSTOMER SUPPORT PORTAL
              </div>
            </div>
          </div>

          <h1 style={{ marginBottom: 8 }}>
            {authMode === "login"
              ? "Customer Login"
              : "Create Customer Account"}
          </h1>

          <p style={{ color: "#8e9aaa", marginBottom: 22 }}>
            {authMode === "login"
              ? "Sign in to view only your Freshdesk tickets."
              : "Create an account to securely access your own support tickets."}
          </p>

          {authError && (
            <div className="error-banner">{authError}</div>
          )}

          <form
            onSubmit={submitAuth}
            style={{ display: "grid", gap: 14 }}
          >
            {authMode === "register" && (
              <>
                <input
                  placeholder="Full name"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      name: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Phone number (optional)"
                  value={authForm.phone}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      phone: e.target.value
                    })
                  }
                />

                <input
                  placeholder="Company (optional)"
                  value={authForm.company}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      company: e.target.value
                    })
                  }
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({
                  ...authForm,
                  email: e.target.value
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              minLength="6"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({
                  ...authForm,
                  password: e.target.value
                })
              }
              required
            />

            <button
              className="customer-primary"
              type="submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            className="switch-btn"
            style={{ width: "100%", marginTop: 12 }}
            onClick={() => {
              setAuthError("");
              setAuthMode(
                authMode === "login"
                  ? "register"
                  : "login"
              );
            }}
          >
            {authMode === "login"
              ? "New customer? Create an account"
              : "Already have an account? Login"}
          </button>

          <button
            type="button"
            className="switch-btn"
            style={{ width: "100%", marginTop: 10 }}
            onClick={onSwitchManager}
          >
            Manager Access
          </button>
        </div>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="page-state">
        <h1>Loading customer account...</h1>
      </div>
    );
  }

  return (
    <div className="customer-app">
      <header className="customer-header">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <div className="brand-name">BACKJOBS</div>
            <div className="brand-tag">
              ACCESS. CONTROL. SIMPLIFIED.
            </div>
          </div>
        </div>

        <nav className="customer-nav">
          {["Home", "My Tickets", "New Ticket", "Help Center"].map(
            (item) => (
              <button
                key={item}
                className={view === item ? "active" : ""}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            )
          )}
        </nav>

        <div className="customer-top-actions">
          <div style={{ textAlign: "right" }}>
            <strong>{user?.name || user?.email}</strong>
            <small style={{ display: "block", opacity: 0.65 }}>
              Customer
            </small>
          </div>

          <button
            className="switch-btn"
            onClick={logout}
          >
            Logout
          </button>

          <button
            className="switch-btn"
            onClick={onSwitchManager}
          >
            <Icon name="switch" size={17} />
            Manager
          </button>
        </div>
      </header>

      <main className="customer-main">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {view === "Home" && (
          <>
            <section className="customer-hero">
              <div>
                <span className="eyebrow">CUSTOMER SUPPORT</span>
                <h1>Hello, {user?.name || "Customer"}</h1>
                <p>
                  View and manage only the Freshdesk tickets linked to your account.
                </p>

                <button
                  className="customer-primary"
                  onClick={() => setView("New Ticket")}
                >
                  Create New Ticket
                </button>
              </div>
            </section>

            <div className="customer-stats">
              <div><span>Open</span><strong>{openCount}</strong></div>
              <div><span>Pending</span><strong>{pendingCount}</strong></div>
              <div><span>Resolved</span><strong>{resolvedCount}</strong></div>
              <div><span>Total</span><strong>{tickets.length}</strong></div>
            </div>

            <section className="customer-section">
              <div className="section-head">
                <div>
                  <h1>Recent Tickets</h1>
                  <p>Live tickets from your account.</p>
                </div>
                <button
                  className="switch-btn"
                  onClick={() => setView("My Tickets")}
                >
                  View All
                </button>
              </div>

              {ticketLoading ? (
                <div className="empty loading-state">
                  <span className="loading-spinner"></span>
                  Loading your tickets...
                </div>
              ) : tickets.length ? (
                <div className="customer-ticket-content">
                  <div className="customer-ticket-list">
                    {tickets.slice(0, 5).map((ticket) => (
                      <button
                        className="customer-ticket-row"
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setView("My Tickets");
                        }}
                      >
                        <div className="ticket-row-main">
                          <div className="ticket-id">
                            #{ticket.id}
                          </div>

                          <div className="ticket-info">
                            <strong>
                              {ticket.subject || "Untitled ticket"}
                            </strong>

                            <small>
                              {statusName(ticket.status)} ·{" "}
                              {priorityName(ticket.priority)}
                            </small>
                          </div>
                        </div>

                        <div className="ticket-arrow">→</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty">
                  <div className="empty-icon">◫</div>
                  <strong>No tickets yet</strong>
                  <span>
                    Your support tickets will appear here.
                  </span>
                </div>
              )}
            </section>
          </>
        )}

        {view === "My Tickets" && (
          <section className="customer-section">
            <div className="section-head">
              <div>
                <h1>My Tickets</h1>
                <p>Only tickets belonging to your account are shown.</p>
              </div>
              <button
                className="icon-control"
                onClick={loadTickets}
                title="Refresh tickets"
              >
                <Icon name="refresh" size={17} />
              </button>
            </div>

            {ticketLoading ? (
              <div className="empty">Loading your tickets...</div>
            ) : tickets.length ? (
              <div className="customer-ticket-list">
                {tickets.map((ticket) => (
                  <button
                    className="customer-ticket-row"
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <strong>#{ticket.id} · {ticket.subject || "Untitled ticket"}</strong>
                    <small>
                      {statusName(ticket.status)} · {priorityName(ticket.priority)}
                      {ticket.updated_at
                        ? ` · ${new Date(ticket.updated_at).toLocaleString()}`
                        : ""}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">You have no tickets yet.</div>
            )}

            {selectedTicket && (
              <div className="ticket-detail">
                <h2>#{selectedTicket.id} · {selectedTicket.subject}</h2>
                <p>
                  <strong>Status:</strong> {statusName(selectedTicket.status)}
                  {" · "}
                  <strong>Priority:</strong> {priorityName(selectedTicket.priority)}
                </p>
                <p>
                  {selectedTicket.description_text ||
                    selectedTicket.description ||
                    "No description available."}
                </p>
              </div>
            )}
          </section>
        )}

        {view === "New Ticket" && (
          <section className="customer-section">
            <div className="section-head">
              <div>
                <h1>Create New Ticket</h1>
                <p>This ticket will automatically be assigned to your account.</p>
              </div>
            </div>

            <form className="customer-form" onSubmit={submitTicket}>
              <label>
                Subject
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="What do you need help with?"
                  required
                />
              </label>

              <label>
                Type
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">General</option>
                  <option value="Question">Question</option>
                  <option value="Incident">Incident</option>
                  <option value="Problem">Problem</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="1">Low</option>
                  <option value="2">Medium</option>
                  <option value="3">High</option>
                  <option value="4">Urgent</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  rows="7"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your issue..."
                  required
                />
              </label>

              <button className="customer-primary" type="submit">
                Submit Ticket
              </button>
            </form>
          </section>
        )}

     {view === "Help Center" && (
  <section className="customer-section">
    <div className="empty">
      Help Center can be connected to Freshdesk Solutions later.
    </div>
  </section>
)}
</main>
</div>
);
}
/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [role, setRole] =
    useState("Manager");

  const [active, setActive] =
    useState("Dashboard");

  const [menuOpen, setMenuOpen] =
    useState(false);

  if (role === "Customer") {
    return (
      <CustomerPortal
        onSwitchManager={() =>
          setRole("Manager")
        }
      />
    );
  }

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            B
          </div>

          <div>
            <div className="brand-name">
              BACKJOBS
            </div>

            <div className="brand-tag">
              ACCESS. CONTROL. SIMPLIFIED.
            </div>
          </div>

        </div>

        <nav>

          <button
            className={`nav-item ${
              active === "Dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActive("Dashboard")
            }
          >
            <Icon name="dashboard" />
            Dashboard
          </button>

          <div className="nav-group">

            <div className="group-title">
              SUPPORT
            </div>

            <button
              className={`nav-item ${
                active === "Tickets"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActive("Tickets")
              }
            >
              <Icon name="ticket" />
              Tickets
            </button>

            <button
              className={`nav-item ${
                active === "Customers"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActive("Customers")
              }
            >
              <Icon name="users" />
              Customers
            </button>

          </div>

        </nav>

        <div className="current-role">

          <div className="role-icon">
            <Icon
              name="user"
              size={18}
            />
          </div>

          <div>
            <div className="role-caption">
              CURRENT ROLE
            </div>

            <strong>
              MANAGER
            </strong>

            <div className="role-status">
              <span />

              Full access to support
              dashboard
            </div>
          </div>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <button
            className="hamburger"
            onClick={() =>
              setMenuOpen(
                (value) => !value
              )
            }
          >
            <Icon
              name="menu"
              size={21}
            />
          </button>

          <div className="search">
            <Icon
              name="search"
              size={19}
            />

            <input
              placeholder="Search tickets, customers..."
            />
          </div>

          <div className="top-actions">

            <button
              className="switch-btn"
              onClick={() =>
                setRole("Customer")
              }
            >
              <Icon
                name="switch"
                size={17}
              />

              Customer

              <Icon
                name="chevron"
                size={14}
              />
            </button>

            <button className="icon-btn notification">
              <Icon
                name="bell"
                size={20}
              />
            </button>

            <div className="profile">
              <div className="avatar">
                V
              </div>

              <div>
                <strong>
                  void
                </strong>

                <small>
                  Manager
                </small>
              </div>

              <Icon
                name="chevron"
                size={15}
              />
            </div>

          </div>

        </header>

        {menuOpen && (
          <div className="mobile-menu">

            <button
              onClick={() => {
                setActive(
                  "Dashboard"
                );

                setMenuOpen(false);
              }}
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                setActive(
                  "Tickets"
                );

                setMenuOpen(false);
              }}
            >
              Tickets
            </button>

            <button
              onClick={() => {
                setActive(
                  "Customers"
                );

                setMenuOpen(false);
              }}
            >
              Customers
            </button>

          </div>
        )}

        <section className="content">

          {active === "Dashboard" && (
            <Dashboard />
          )}

          {active === "Tickets" && (
            <ManagerTickets />
          )}

          {active === "Customers" && (
            <Customers />
          )}

        </section>

      </main>

    </div>
  );
}