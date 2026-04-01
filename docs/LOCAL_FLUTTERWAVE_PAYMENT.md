# Local testing with real Flutterwave (Rwanda MoMo)

## Quick commands (repo root)

| Command | Purpose |
|--------|--------|
| `npm run payment:check` | Print whether `.env` is ready + **exact webhook URL** to paste in Flutterwave |
| `npm run env:init-payment` | Create `backend/.env` from `.env.example` **only if** `.env` is missing |

Your backend already calls `flutterwave-node-v3` and exposes:

- `POST .../payment/webhook` — server-to-server confirmation  
- `GET .../payment-success` — browser return URL after checkout  

Flutterwave **cannot** open `http://localhost` on your machine. Use a tunnel.

## 1. Install ngrok

[ngrok](https://ngrok.com/) — then:

```bash
ngrok http 8000
```

Copy the **HTTPS** forwarding URL (e.g. `https://abc123.ngrok-free.app`).

## 2. Configure `backend/.env`

Copy `backend/.env.example` → `backend/.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `USE_REAL_PAYMENT=true` | Stops mock “instant success” |
| `FLW_PUBLIC_KEY` / `FLW_SECRET_KEY` | Flutterwave dashboard (test mode) |
| `FLW_SECRET_HASH` | Same value as “Secret hash” on the Webhook settings |
| `PUBLIC_BACKEND_URL` | Your ngrok HTTPS URL **without** trailing slash |
| `FRONTEND_URL` | Usually `http://localhost:5173` (Vite) |
| `TRUST_PROXY=1` | So Express treats proxied requests as HTTPS |

Example:

```env
PUBLIC_BACKEND_URL=https://abc123.ngrok-free.app
FRONTEND_URL=http://localhost:5173
TRUST_PROXY=1
```

## 3. Flutterwave Dashboard

1. **Webhook URL:**  
   `https://YOUR-NGROK-SUBDOMAIN.ngrok-free.app/api/v1/payment/webhook`

2. Save the **secret hash** into `FLW_SECRET_HASH` in `.env`.

3. Use **test** secrets until you are ready for live money.

## 4. Run the app

Terminal 1 — API (port **8000** must match ngrok; this repo uses root `server` script):

```bash
npm run server
```

Terminal 2 — tunnel:

```bash
ngrok http 8000
```

Then update `PUBLIC_BACKEND_URL` in `backend/.env` to the HTTPS URL ngrok shows, and run:

```bash
npm run payment:check
```

Terminal 3 — frontend:

```bash
cd frontend && npm run dev
```

If your API port or Vite port differs, update ngrok, `.env`, and `FRONTEND_URL`.

## 5. What happens on success

1. User pays on Flutterwave / MoMo.  
2. User is redirected to `PUBLIC_BACKEND_URL/api/v1/payment-success?...`  
3. Server verifies the transaction, updates `Payment` + `Appointment`.  
4. Browser is redirected to `FRONTEND_URL/patient/payment-success-page`.

## Troubleshooting

- **Instant success, no MoMo page:** `USE_REAL_PAYMENT` is not `true`, or keys missing (mock mode).  
- **Webhook 401:** `FLW_SECRET_HASH` does not match the dashboard, or header `verif-hash` missing.  
- **Redirect loops / wrong host:** Check `PUBLIC_BACKEND_URL` and `TRUST_PROXY=1` behind ngrok.  
- **CORS:** Backend `app.js` already allows `http://localhost:5173`; keep frontend API base URL pointing at **local** API (`http://localhost:8000`) — only Flutterwave uses the ngrok URL.
