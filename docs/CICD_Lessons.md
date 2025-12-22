# CI/CD Lessons Learned

This document captures key CI/CD and deployment lessons learned while building and debugging the multi-environment (Dev / QA / Prod) Docker + Jenkins setup for this project.

The goal is to document **why things broke**, **how we figured it out**, **how they were fixed**, and **how to avoid similar issues in the future**.

---

## 1. Docker Compose Uses Image Tags Literally

### What went wrong
`docker-compose.yml` referenced images using the `:latest` tag:

```yaml
frontend:
  image: subscription-app-frontend:latest

backend:
  image: subscription-app-backend:latest
````

However, Jenkins was building images tagged only with the build number:

```
subscription-app-frontend:<BUILD_NUMBER>
subscription-app-backend:<BUILD_NUMBER>
```

Since the `latest` tag was never updated, Docker Compose kept deploying an **old image**, even though newer images existed locally.

### Key takeaway

> Docker Compose does **not** automatically use the newest image — it uses the **exact tag you specify**.

---

## 2. “Build Succeeded” Does Not Mean “Deployment Updated”

### What went wrong

* Jenkins successfully built new images
* Docker Compose successfully ran `up -d`
* But the running containers were still using an **old image**

This created a false sense of success: everything *looked* correct, but the application was still running stale code.

### Fix

During deployment, explicitly retag the newly built images as `latest`:

```bash
docker tag subscription-app-frontend:<BUILD_NUMBER> subscription-app-frontend:latest
docker tag subscription-app-backend:<BUILD_NUMBER>  subscription-app-backend:latest
```

And force container recreation:

```bash
docker compose up -d --force-recreate
```

### Key takeaway

> Always ensure the image tag used by Docker Compose is updated during deployment.

---

## 3. How We Identified the Root Cause

This issue was diagnosed by **verifying what image was actually running**, not just what Jenkins claimed to have built.

### Step 1: Check which image the container was running

We inspected the running frontend container:

```bash
docker inspect subscription-app-frontend-dev --format '{{.Image}}'
```

This returned an image digest corresponding to an image that was **several days old**.

### Step 2: Compare against locally available images

We then listed all frontend images:

```bash
docker images subscription-app-frontend
```

This revealed:

* `subscription-app-frontend:latest` → **old image**
* `subscription-app-frontend:<BUILD_NUMBER>` → **new image**

Despite the new image existing locally, Docker Compose was still running the older `latest` tag.

### Step 3: Confirm stale frontend assets

To remove any doubt, we inspected the built frontend assets inside the running container:

```bash
docker exec -it subscription-app-frontend-dev \
  grep -R "localhost:8000" /usr/share/nginx/html/assets
```

This confirmed the running container was serving **stale frontend code** that still contained an absolute API base (`http://localhost:8000/api`).

### Conclusion

The issue was **not** with Docker networking, Nginx proxying, or backend ports.

It was a **deployment mismatch**:

* Jenkins built the correct image
* Docker Compose deployed a different one

---

## 4. Frontend Builds Are Immutable (Vite Build-Time Reality)

### What went wrong

The frontend bundle still contained:

```js
http://localhost:8000/api
```

even after environment variables were changed.

This happened because:

* Vite embeds environment variables **at build time**
* The running container was serving an old frontend image
* Runtime environment changes had no effect

### Fix

* Pass `VITE_API_BASE_URL=/api` explicitly during the Docker build
* Ensure the **correct image** is actually deployed

### Key takeaway

> Frontend builds are immutable artifacts. If the JS bundle is wrong, you must rebuild and redeploy.

---

## 5. Single-Origin + Reverse Proxy Is the Correct Architecture

### Final architecture

* Browser talks only to the frontend:

  ```
  http://localhost:<frontend_port>
  ```
* Frontend JavaScript calls APIs using relative paths:

  ```
  /api/...
  ```
* Nginx proxies `/api/*` to the backend over the Docker network:

  ```
  backend:8000
  ```

This avoids:

* CORS issues
* Hardcoded backend ports in frontend code
* Environment-specific frontend logic

### Key takeaway

> Frontend code should never know backend ports. Nginx is the boundary.

---

## 6. Debug Commits Are Normal — Clean History Is Intentional

### What happened

Multiple commits were created while debugging:

* build args
* docker cache
* env handling
* compose behavior

Once the root cause was identified, all exploratory commits were **squashed into a single, documented fix**.

### Final result

* Clean Git history
* One authoritative commit describing the problem and solution
* Easier onboarding and future maintenance

### Key takeaway

> Experiment freely, but squash intentionally.

---

## 7. Preventing This in the Future

Recommended safeguards:

* Avoid relying on `latest` entirely; prefer explicit image tags
* Add a CI check to grep frontend assets for forbidden strings (e.g. `localhost:8000`)
* Always verify running container image IDs during deployments
* Document CI/CD assumptions early

---

## Summary

This issue was not caused by Docker, Jenkins, Nginx, or Vite individually.

It was caused by a **mismatch between build artifacts and deployment expectations**.

Once image tagging, deployment behavior, and frontend build immutability were aligned, the system behaved predictably across all environments.

This document exists so this lesson only needs to be learned once.
