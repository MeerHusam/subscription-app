# Subscription App

**Author:** Meer Husamuddin
**Repository:** [Link to Repo](https://github.com/MeerHusam/subscription-app.git)

This project is a full-stack web application designed to track subscriptions, renewal dates, and basic analytics. It includes a comprehensive **Jenkins CI/CD pipeline** for automated testing and deployment.

---

## Tech Stack

- **Backend:** Django + Django REST Framework (PostgreSQL in Docker)
- **Frontend:** React + Vite + Tailwind CSS
- **CI/CD:** Jenkins, Docker, Nginx

---

## App Quickstart (Local Development)

To run the application locally without Jenkins:

**1. Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver           # http://localhost:8000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

---

## Jenkins CI/CD Documentation

This project features a fully automated pipeline. The `docs/` folder contains detailed guides.

### Documentation Files

#### [`docs/JENKINS_QUICKSTART.md`](docs/JENKINS_QUICKSTART.md)
**Start here!** Step-by-step guide to get Jenkins up and running.
- Setting up Jenkins used `docker-compose.jenkins.yml`
- Getting the admin password
- Running your first pipeline build

#### [`docs/JENKINS_REFERENCE.md`](docs/JENKINS_REFERENCE.md)
**Complete reference guide** with detailed explanations and diagrams.
- CI/CD Concepts & Docker-in-Docker
- Visual diagrams of the workflow
- Troubleshooting guide

---

## Project Configuration Files

- **`jenkins/Dockerfile`** - Custom Jenkins image definition
- **`docker-compose.jenkins.yml`** - Jenkins container configuration
- **`Jenkinsfile`** - The Pipeline definition (Groovy script)

---

## Running the Pipeline

1. **Start Jenkins:**
   ```bash
   docker-compose -f docker-compose.jenkins.yml up -d
   ```
2. **Access UI:** Open `http://localhost:8080`
3. **Run Pipeline:**
   - Go to `subscription-app-pipeline`
   - Click **Build Now**
   - Approve deployments to QA/Prod when prompted.

---

## Recommended Reading Order

1. **First time setup:** Read `docs/JENKINS_QUICKSTART.md`
2. **Understanding concepts:** Read `docs/JENKINS_REFERENCE.md`
3. **Deep Dive:** Read **[`README-Pipeline.md`](README-Pipeline.md)** for the full assignment report.
