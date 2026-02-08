# 🚀 Quick Start Guide - Jenkins Setup

## ✅ Files Created

You now have these files in your project:

1. **`jenkins/Dockerfile`** - Custom Jenkins image with Docker CLI
2. **`docker-compose.jenkins.yml`** - Configuration to run Jenkins
3. **`Jenkinsfile`** - Pipeline definition (what Jenkins does)
4. **`JENKINS_REFERENCE.md`** - Complete reference guide

---

## 🎯 Next Steps

### Step 1: Start Jenkins

Run this command in your project directory:

```bash
docker-compose -f docker-compose.jenkins.yml up -d
```

**What happens:**
- Downloads official Jenkins image (~750 MB) - first time only
- Builds your custom Jenkins image
- Starts Jenkins container
- Jenkins runs at http://localhost:8080

**Expected output:**
```
[+] Building ...
[+] Running 2/2
 ✔ Network subscription-app-jenkins_jenkins-network  Created
 ✔ Container jenkins-server                          Started
```

---

### Step 2: Get Initial Admin Password

Jenkins generates a random password on first startup. Get it with:

```bash
docker-compose -f docker-compose.jenkins.yml logs jenkins | grep -A 5 "Jenkins initial setup"
```

**Look for:**
```
*************************************************************
Jenkins initial setup is required...
Please use the following password to proceed to installation:

a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

*************************************************************
```

Copy this password!

---

### Step 3: Access Jenkins UI

1. Open browser: **http://localhost:8080**
2. Paste the admin password
3. Click **Continue**

---

### Step 4: Install Plugins

1. Click **Install suggested plugins**
2. Wait for installation (~5 minutes)
3. When prompted, install these additional plugins:
   - Docker Pipeline
   - Docker
   - Git (should already be installed)

---

### Step 5: Create Admin User

1. Fill in the form:
   - Username: (your choice)
   - Password: (your choice)
   - Full name: (your name)
   - Email: (your email)
2. Click **Save and Continue**
3. Keep default Jenkins URL
4. Click **Start using Jenkins**

---

### Step 6: Create Pipeline Job

1. Click **New Item**
2. Enter name: `subscription-app-pipeline`
3. Select **Pipeline**
4. Click **OK**
5. Scroll to **Pipeline** section
6. For **Definition**, select: **Pipeline script from SCM**
7. For **SCM**, select: **Git**
8. For **Repository URL**, enter: `https://github.com/MeerHusam/subscription-app.git`
9. For **Branch Specifier**, enter: `*/dev`
10. For **Script Path**, enter: `Jenkinsfile`
11. Click **Save**

---

### Step 7: Run First Build

1. Click **Build Now**
2. Watch the build progress
3. Click on build #1
4. Click **Console Output** to see logs

**Expected result:**
- All stages complete successfully
- New Docker images created:
  - `subscription-app-backend:1`
  - `subscription-app-frontend:1`

---

## 🔍 Verify Images Were Built

After the build completes, run:

```bash
docker images | grep subscription-app
```

**You should see:**
```
subscription-app-backend    latest    ...    ...    500MB
subscription-app-backend    1         ...    ...    500MB
subscription-app-frontend   latest    ...    ...    50MB
subscription-app-frontend   1         ...    ...    50MB
```

---

## 🛠️ Useful Commands

```bash
# View Jenkins logs
docker-compose -f docker-compose.jenkins.yml logs -f jenkins

# Stop Jenkins
docker-compose -f docker-compose.jenkins.yml down

# Restart Jenkins
docker-compose -f docker-compose.jenkins.yml restart jenkins

# Check if Jenkins is running
docker-compose -f docker-compose.jenkins.yml ps
```

---

## 📚 Need More Help?

- **Detailed reference:** See `JENKINS_REFERENCE.md`
- **File explanations:** All files have inline comments
- **Troubleshooting:** Check the reference guide

---

## 🎉 You're Done!

Once Jenkins is running and you've created the pipeline, it will automatically build new Docker images whenever you push code to Git!
