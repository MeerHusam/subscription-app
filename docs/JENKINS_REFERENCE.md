# Jenkins CI/CD Complete Reference Guide

## 📋 Table of Contents
1. [Quick Summary](#quick-summary)
2. [Detailed Explanation](#detailed-explanation)
3. [Visual Diagrams](#visual-diagrams)
4. [Key Concepts](#key-concepts)
5. [Commands Reference](#commands-reference)

---

## 🎯 Quick Summary

**What is Jenkins CI/CD?**
Jenkins automates the process of building Docker images for your application whenever you push code to Git. Instead of manually running `docker build` every time you make changes, Jenkins does it automatically.

**What We're Building:**
A Jenkins server running in Docker that watches your Git repository and automatically builds new versions of your backend and frontend Docker images.

**The Process:**
1. You push code to GitHub
2. Jenkins detects the change
3. Jenkins automatically builds new Docker images
4. New images are tagged with version numbers (build #1, #2, #3, etc.)

---

## 📖 Detailed Explanation

### What is CI/CD?

**CI/CD** = Continuous Integration / Continuous Deployment

Think of it as an automated assembly line for your code:
- **Continuous Integration (CI):** Automatically build and test code when changes are made
- **Continuous Deployment (CD):** Automatically deploy the built code to servers

**Why do we need it?**
- ✅ Saves time (no manual building)
- ✅ Consistency (same build process every time)
- ✅ Version tracking (every build is numbered)
- ✅ Easy rollback (keep previous versions)
- ✅ Automated testing (run tests on every build)

### What is Docker-in-Docker (DinD)?

**The Challenge:**
- We want Jenkins to run in a Docker container (for isolation and portability)
- We want Jenkins to BUILD Docker images (for our backend and frontend)
- Problem: A container normally can't build other containers

**The Solution:**
Give the Jenkins container access to the **host's Docker engine** by mounting the Docker socket (`/var/run/docker.sock`). This way, Jenkins can ask the host machine to build images.

**Security Note:**
This gives Jenkins full access to Docker on your machine. This is fine for development but should be carefully considered for production.

### The Three Main Components

#### 1. **jenkins/Dockerfile** (The Recipe)
- **What it is:** A text file with instructions
- **What it does:** Tells Docker how to build a custom Jenkins image
- **Contains:** Instructions to start with official Jenkins and add Docker CLI
- **Location:** In your Git repository
- **Size:** ~50 lines of code

#### 2. **Custom Jenkins Image** (The Built Product)
- **What it is:** A Docker image (binary file)
- **What it does:** Contains Jenkins + Docker CLI, ready to run
- **Created by:** Running `docker build` on the Dockerfile
- **Location:** Docker's storage on your Mac (~800 MB)
- **Not in Git:** Too large to commit

#### 3. **Jenkins Container** (The Running Instance)
- **What it is:** A running process from the custom Jenkins image
- **What it does:** Watches Git, builds images automatically
- **Created by:** Running `docker run` on the custom image
- **Access:** http://localhost:8080
- **Project-specific:** Configured for your subscription-app

---

## 🎨 Visual Diagrams

### The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Initial Setup (One-time)                            │
└─────────────────────────────────────────────────────────────┘

Docker Hub (Internet)
    │
    │ jenkins/jenkins:lts (Official Jenkins Image)
    │ - Contains: Jenkins app, Java, web server
    │ - Missing: Docker CLI
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ YOUR MAC                                                    │
│                                                             │
│  You run: docker-compose -f docker-compose.jenkins.yml up -d│
│                                                             │
│  Step 1: Downloads jenkins/jenkins:lts                      │
│          └─ Stored in Docker storage (global)               │
│                                                             │
│  Step 2: Reads jenkins/Dockerfile                           │
│          └─ Instructions: Add Docker CLI to official image  │
│                                                             │
│  Step 3: Builds Custom Jenkins Image                        │
│          └─ Official Jenkins + Docker CLI                   │
│          └─ Stored in Docker storage (project-specific)     │
│                                                             │
│  Step 4: Starts Jenkins Container                           │
│          └─ Running at http://localhost:8080                │
│          └─ Watching for code changes                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Automated Builds (Every code push)                  │
└─────────────────────────────────────────────────────────────┘

You push code to GitHub
    │
    ▼
Jenkins detects change (webhook or polling)
    │
    ▼
Jenkins runs Jenkinsfile pipeline:
    │
    ├─ Stage 1: Checkout code from Git
    │
    ├─ Stage 2: Build backend image
    │   └─ docker build -t subscription-app-backend:BUILD_NUMBER
    │
    ├─ Stage 3: Build frontend image
    │   └─ docker build -t subscription-app-frontend:BUILD_NUMBER
    │
    ├─ Stage 4: Run tests (optional)
    │
    └─ Stage 5: Push to registry (optional)
    │
    ▼
New images created:
    - subscription-app-backend:1, :2, :3...
    - subscription-app-frontend:1, :2, :3...
```

### Image Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│ DOCKER HUB (Internet - Global)                           │
│                                                          │
│  jenkins/jenkins:lts                                     │
│  ├─ Official Jenkins image                               │
│  ├─ Maintained by Jenkins team                           │
│  ├─ Downloaded automatically                             │
│  └─ Shared across all projects                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Download (first time only)
                     ▼
┌──────────────────────────────────────────────────────────┐
│ YOUR MAC - Docker Storage                                │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ GLOBAL IMAGES                              │         │
│  │                                            │         │
│  │  jenkins/jenkins:lts (750 MB)              │         │
│  │  └─ Downloaded from Docker Hub             │         │
│  │  └─ Used as base for custom images         │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ PROJECT-SPECIFIC IMAGES                    │         │
│  │                                            │         │
│  │  subscription-app-jenkins (800 MB)         │         │
│  │  ├─ Built from jenkins/Dockerfile          │         │
│  │  ├─ Based on jenkins/jenkins:lts           │         │
│  │  └─ Adds Docker CLI                        │         │
│  │                                            │         │
│  │  subscription-app-backend:1, :2, :3...     │         │
│  │  └─ Built by Jenkins automatically         │         │
│  │                                            │         │
│  │  subscription-app-frontend:1, :2, :3...    │         │
│  │  └─ Built by Jenkins automatically         │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### File vs Image vs Container

```
┌─────────────────────────────────────────────────────────┐
│ YOUR GIT REPOSITORY (Source Code)                       │
│                                                         │
│  jenkins/Dockerfile                                     │
│  ├─ Type: Text file (instructions)                      │
│  ├─ Size: ~50 lines                                     │
│  ├─ Purpose: Recipe for building custom Jenkins image   │
│  ├─ Committed to Git: YES ✅                            │
│  └─ Contains: FROM jenkins/jenkins:lts                  │
│               RUN install docker-cli                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ docker build
                     ▼
┌─────────────────────────────────────────────────────────┐
│ DOCKER STORAGE (Built Images)                           │
│                                                         │
│  Custom Jenkins Image                                   │
│  ├─ Type: Binary file (built product)                   │
│  ├─ Size: ~800 MB                                       │
│  ├─ Purpose: Ready-to-run Jenkins with Docker CLI       │
│  ├─ Committed to Git: NO ❌                             │
│  └─ Built from: jenkins/Dockerfile                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ docker run
                     ▼
┌─────────────────────────────────────────────────────────┐
│ RUNNING PROCESSES (Active Containers)                   │
│                                                         │
│  Jenkins Container                                      │
│  ├─ Type: Running process                               │
│  ├─ Memory: Uses RAM                                    │
│  ├─ Purpose: Actively building your app images          │
│  ├─ Access: http://localhost:8080                       │
│  └─ Created from: Custom Jenkins Image                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Concepts

### Official vs Custom Jenkins Image

| Aspect | Official Image | Custom Image |
|--------|---------------|--------------|
| **Source** | Docker Hub (Jenkins team) | Built by you |
| **Name** | `jenkins/jenkins:lts` | `subscription-app-jenkins` |
| **Scope** | Global (any project) | Project-specific |
| **Contents** | Jenkins + Java | Jenkins + Java + Docker CLI |
| **Can build Docker images?** | ❌ No | ✅ Yes |
| **Location** | Docker storage (after download) | Docker storage (after build) |
| **In Git repo?** | ❌ No | ❌ No (only Dockerfile is) |

### Dockerfile vs Image vs Container

| Aspect | Dockerfile | Image | Container |
|--------|-----------|-------|-----------|
| **What is it?** | Text file (recipe) | Binary file (product) | Running process |
| **Editable?** | ✅ Yes (text editor) | ❌ No | ❌ No |
| **In Git?** | ✅ Yes | ❌ No | ❌ No |
| **Size** | ~2 KB | ~800 MB | Uses RAM |
| **Purpose** | Instructions | Ready-to-run package | Active service |
| **Created by** | You write it | `docker build` | `docker run` |

### Build Process Analogy

Think of it like baking a cake:

1. **Recipe Card** = `jenkins/Dockerfile`
   - Written instructions
   - Stored in your cookbook (Git repo)
   - Can be shared with others

2. **Ingredients** = `jenkins/jenkins:lts` (official image)
   - Basic components (flour, eggs, sugar)
   - Bought from store (Docker Hub)
   - Shared across all recipes

3. **Baked Cake** = Custom Jenkins Image
   - Final product from following the recipe
   - Stored in your fridge (Docker storage)
   - Ready to serve

4. **Serving the Cake** = Jenkins Container
   - Actually using/eating the cake
   - Active consumption
   - The purpose of everything above

---

## 💻 Commands Reference

### Initial Setup (One-time)

```bash
# Navigate to your project
cd /Users/meerhusamuddin/Desktop/Developer/SubscriptionApplication/subscription-app

# Start Jenkins (builds image + starts container)
docker-compose -f docker-compose.jenkins.yml up -d

# Get initial admin password
docker-compose -f docker-compose.jenkins.yml logs jenkins | grep -A 5 "Jenkins initial setup"

# Access Jenkins UI
open http://localhost:8080
```

### Daily Operations

```bash
# Start Jenkins (if stopped)
docker-compose -f docker-compose.jenkins.yml up -d

# Stop Jenkins
docker-compose -f docker-compose.jenkins.yml down

# Restart Jenkins
docker-compose -f docker-compose.jenkins.yml restart jenkins

# View Jenkins logs
docker-compose -f docker-compose.jenkins.yml logs -f jenkins

# View all Docker images
docker images

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a
```

### Troubleshooting

```bash
# Check if Jenkins container is running
docker-compose -f docker-compose.jenkins.yml ps

# View detailed container info
docker inspect jenkins-server

# Check Docker disk usage
docker system df

# Remove unused images (cleanup)
docker image prune -f

# Rebuild Jenkins image (if Dockerfile changed)
docker-compose -f docker-compose.jenkins.yml build --no-cache

# Complete reset (removes all data!)
docker-compose -f docker-compose.jenkins.yml down -v
```

### Checking Built Images

```bash
# List all images
docker images

# Filter for subscription-app images
docker images | grep subscription-app

# Expected output:
# subscription-app-backend    latest    abc123    2 mins ago    500MB
# subscription-app-backend    1         abc123    2 mins ago    500MB
# subscription-app-frontend   latest    def456    2 mins ago    50MB
# subscription-app-frontend   1         def456    2 mins ago    50MB
```

---

## 🎯 The Complete Process Summary

### One-Time Setup
1. Create `jenkins/Dockerfile` in your project
2. Create `docker-compose.jenkins.yml` in your project
3. Create `Jenkinsfile` in your project root
4. Run: `docker-compose -f docker-compose.jenkins.yml up -d`
5. Access Jenkins at http://localhost:8080
6. Complete initial setup (unlock, install plugins, create admin user)
7. Create pipeline job pointing to your Jenkinsfile

### Automated Workflow (After Setup)
1. You make code changes
2. You push to GitHub
3. Jenkins detects the change (webhook or polling)
4. Jenkins runs the pipeline:
   - Checks out latest code
   - Builds backend Docker image (tagged with build number)
   - Builds frontend Docker image (tagged with build number)
   - Runs tests (if configured)
   - Pushes to registry (if configured)
5. New images are ready to deploy

### What Gets Created

**In Your Git Repository:**
- `jenkins/Dockerfile` (text file, ~2 KB)
- `docker-compose.jenkins.yml` (text file, ~1 KB)
- `Jenkinsfile` (text file, ~5 KB)

**In Docker Storage:**
- `jenkins/jenkins:lts` (official image, ~750 MB, global)
- Custom Jenkins image (~800 MB, project-specific)
- Backend images (multiple versions, ~500 MB each)
- Frontend images (multiple versions, ~50 MB each)

**Running Processes:**
- Jenkins container (when started)
- Your app containers (when you deploy the built images)

---

## 🚀 Next Steps

After understanding this reference:

1. **Create the files** (jenkins/Dockerfile, docker-compose.jenkins.yml, Jenkinsfile)
2. **Start Jenkins** for the first time
3. **Configure the pipeline** in Jenkins UI
4. **Test the automation** by pushing code
5. **Add testing stages** to the pipeline
6. **Configure webhooks** for automatic triggers
7. **Set up Docker registry** for image storage

---

## 📚 Additional Resources

- **Jenkins Documentation:** https://www.jenkins.io/doc/
- **Docker Documentation:** https://docs.docker.com/
- **Jenkins Pipeline Syntax:** https://www.jenkins.io/doc/book/pipeline/syntax/
- **Docker Compose Reference:** https://docs.docker.com/compose/compose-file/

---

**Last Updated:** December 2025  
**Project:** Subscription App  
**Purpose:** Jenkins CI/CD Setup Reference
