# Backjobs Freshdesk Manager Dashboard

## Project structure

- `frontend/` — React + Vite dashboard and Leads UI
- `backend/` — Node/Express API and Freshdesk integration

## Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Start backend

Open a second terminal:

```bash
cd backend
npm install
copy .env.example .env
npm start
```

Edit `backend/.env`:

```env
FRESHDESK_DOMAIN=yourdomain.freshdesk.com
FRESHDESK_API_KEY=your_api_key
PORT=5000
```

The frontend uses `http://localhost:5000/api` by default. To override it, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

If Freshdesk credentials are not configured, the dashboard uses demo data.

## Scope

- Manager Dashboard
- Leads
- Freshdesk support integration
- No Deals / Companies / Contacts / Jira pages
