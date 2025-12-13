# 📚 Jenkins CI/CD Documentation

This folder contains all documentation for the Jenkins CI/CD setup.

---

## 📄 Documentation Files

### [`JENKINS_QUICKSTART.md`](./JENKINS_QUICKSTART.md)
**Start here!** Step-by-step guide to get Jenkins up and running.

**Use this when:**
- Setting up Jenkins for the first time
- Need quick commands to start/stop Jenkins
- Creating your first pipeline

**Contents:**
- Starting Jenkins
- Getting admin password
- Installing plugins
- Creating pipeline job
- Running first build
- Useful commands

---

### [`JENKINS_REFERENCE.md`](./JENKINS_REFERENCE.md)
**Complete reference guide** with detailed explanations and diagrams.

**Use this when:**
- Want to understand how everything works
- Need to troubleshoot issues
- Looking for specific commands
- Want to see visual diagrams

**Contents:**
- Detailed concept explanations (CI/CD, Docker-in-Docker)
- Visual diagrams of the complete flow
- Comparison tables (Dockerfile vs Image vs Container)
- Complete commands reference
- Troubleshooting guide

---

## 🗂️ Project Files (Outside docs/)

### Configuration Files

- **`jenkins/Dockerfile`** - Custom Jenkins image definition
- **`docker-compose.jenkins.yml`** - Jenkins container configuration
- **`Jenkinsfile`** - CI/CD pipeline definition

All files include extensive inline comments explaining each line.

---

## 🚀 Quick Start

```bash
# 1. Start Jenkins
docker-compose -f docker-compose.jenkins.yml up -d

# 2. Get admin password
docker-compose -f docker-compose.jenkins.yml logs jenkins | grep -A 5 "Jenkins initial setup"

# 3. Access Jenkins
open http://localhost:8080
```

Then follow [`JENKINS_QUICKSTART.md`](./JENKINS_QUICKSTART.md) for detailed setup steps.

---

## 📖 Recommended Reading Order

1. **First time setup:** Read `JENKINS_QUICKSTART.md`
2. **Understanding concepts:** Read `JENKINS_REFERENCE.md`
3. **Understanding code:** Read inline comments in:
   - `jenkins/Dockerfile`
   - `docker-compose.jenkins.yml`
   - `Jenkinsfile`

---

## 🆘 Need Help?

- **Quick commands:** See `JENKINS_QUICKSTART.md`
- **Troubleshooting:** See `JENKINS_REFERENCE.md` → Troubleshooting section
- **Understanding files:** All config files have inline comments
