# ABOF Foundation website

This workspace contains the ABOF public website and admin dashboard (`ABOF_FRONTEND`) plus the REST API (`ABOF_BACKEND`). It follows the project brief's React, FastAPI and PostgreSQL direction while keeping development simple with SQLite by default. Set `ABOF_DATABASE_URL` to a PostgreSQL connection string for hosted environments.

## Start the API

```powershell
cd ABOF_BACKEND
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m app.cli --create-admin
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`; interactive API documentation is at `http://localhost:8000/docs`. Keep `.env` private and set a long, unique `ABOF_SECRET_KEY` and PostgreSQL URL before deployment.

## Start the website

In another PowerShell window:

```powershell
cd ABOF_FRONTEND
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The admin sign-in is at `/admin`. The first administrator is created through the backend CLI; there are no seeded credentials.

## Content and privacy

Public pages only show records explicitly marked **published** in the admin dashboard. Content starts as a draft. The dashboard can manage programmes, projects, news, events, leadership profiles, impact records, publications, gallery entries, and incoming contact/volunteer/partnership submissions. Super administrators can create accounts and assign roles; content contributors can only work on drafts. Submission details are private to authorised reviewers.

Administrators can upload JPEG, PNG, GIF, or WebP images up to 5 MB. Files are stored under `ABOF_UPLOAD_DIR` (default: `ABOF_BACKEND/uploads`) and served from `/media/`. Configure persistent, backed-up storage for deployment.

The site deliberately does not invent contact information, leadership appointments, registration status, implemented projects, impact results, or payment arrangements. Any proposed organisational details should be confirmed before publishing. The PDF's recommendation to keep donations disabled is followed: the support page invites a conversation and does not accept payment.

## Checks

```powershell
cd ABOF_BACKEND
pytest
cd ..\ABOF_FRONTEND
npm run build
```

The SQLite database is created as `ABOF_BACKEND/abof.db` at API startup. Configure PostgreSQL and a managed migration process before production use.
