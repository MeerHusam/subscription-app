# Aajil Subscription App

Track subscriptions, renewal dates, and basic analytics.

## Get the code

```bash
# 1) Create a new workspace folder (optional)
mkdir aajil && cd aajil

# 2) Clone the repo
git clone (https://github.com/MeerHusam/aajil-subscription-app.git) aajil-subscription-app
cd aajil-subscription-app

# (Alternative if you're already inside an empty folder)
# git clone <REPO_URL> .
```
---

## Tech Stack

- **Backend:** Django + Django REST Framework (SQLite for local dev)
- **Frontend:** React + Vite + Tailwind CSS

---

## Quickstart

Open **two terminals**:

**Terminal 1 – Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate            # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# create a .env file (see example below), then:
python manage.py migrate
python manage.py runserver           # serves at http://localhost:8000
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm install
# create a .env file (see example below), then:
npm run dev                          # serves at http://localhost:5173
```

Open the app at **[http://localhost:5173](http://localhost:5173)**.

---

## Backend-Django(Detailed)

### 1) Prereqs

- Python 3.10+ recommended
- pip

### 2) Setup & run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create **`backend/.env`** (minimal example):
The content will be sent in the email

Migrate and start the server:

```bash
python manage.py migrate
python manage.py runserver
```

> API base (by default): `http://localhost:8000/api`

---

## Frontend-React + Vite + Tailwind(Detailed)

### 1) Prereqs

- Node 18+ (or 20+)
- npm (or pnpm/yarn if you prefer)

### 2) Setup & run

```bash
cd frontend
npm install
```

Create **`frontend/.env`** (Vite uses `VITE_*` variables):

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**.

---

## Project Structure (high-level)

```
.
├─ backend/
│  ├─ core/
│  ├─ subscriptions/
│  ├─ manage.py
│  ├─ requirements.txt
│  └─ .env (local)
├─ frontend/
│  └─ (React + Vite + Tailwind app)
└─ README.md
```

---

## Common Issues

- **CORS error in browser:**
  Ensure `CORS_ALLOWED_ORIGINS=http://localhost:5173` is present in `backend/.env` and `django-cors-headers` is installed/configured. Restart the backend.

- **Port already in use:**

  - Change Vite port: `npm run dev -- --port 5174`
  - Change Django port: `python manage.py runserver 8001`

- **DB/model change errors:**

  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

---

That’s it, start the backend on **:8000**, the frontend on **:5173**.
