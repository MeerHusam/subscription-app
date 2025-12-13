# ============================================
# JENKINS DOCKERFILE - Custom Jenkins Image
# ============================================
# Purpose: Create a Jenkins image with Docker CLI installed
# so Jenkins can build Docker images for our app

# --------------------------------------------
# STEP 1: Start with Official Jenkins Image
# --------------------------------------------
# This downloads the official Jenkins LTS (Long Term Support) image
# from Docker Hub. It contains Jenkins, Java, and everything needed
# to run Jenkins - but it does NOT have Docker CLI.
FROM jenkins/jenkins:lts

# --------------------------------------------
# STEP 2: Switch to Root User
# --------------------------------------------
# We need admin (root) privileges to install software.
# By default, the Jenkins image runs as the 'jenkins' user (non-admin).
# We temporarily switch to root to install Docker CLI.
USER root

# --------------------------------------------
# STEP 3: Install Docker CLI
# --------------------------------------------
# This is the core customization! We're installing the Docker CLI
# so Jenkins can run 'docker build', 'docker push', etc.

# Update package lists
RUN apt-get update && \

    # Install prerequisites for adding Docker repository
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release && \
    
    # Add Docker's official GPG key (for security/verification)
    curl -fsSL https://download.docker.com/linux/debian/gpg | \
        gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    
    # Add Docker repository to apt sources
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    
    # Update package lists again (now includes Docker packages)
    apt-get update && \
    
    # Install Docker CLI and Docker Compose plugin
    # Note: We're NOT installing the Docker daemon (dockerd),
    # only the CLI tools. The daemon will be on the host machine.
    apt-get install -y docker-ce-cli docker-compose-plugin && \
    
    # Clean up to reduce image size
    rm -rf /var/lib/apt/lists/*

# --------------------------------------------
# STEP 4: Configure Docker Group Permissions
# --------------------------------------------
# The Docker socket (/var/run/docker.sock) is owned by the 'docker' group.
# We add the jenkins user to this group so it can access Docker.
# Note: GID 999 is commonly used for the docker group, but the actual
# group ID will come from the host when we mount the Docker socket.
RUN groupadd -g 999 docker || true && \
    usermod -aG docker jenkins

# --------------------------------------------
# STEP 5: Switch Back to Jenkins User
# --------------------------------------------
# For security, we switch back to the non-root 'jenkins' user.
# Jenkins will run as this user, but it can still use Docker
# because we added it to the docker group above.
USER jenkins

# --------------------------------------------
# STEP 6: Expose Ports
# --------------------------------------------
# Port 8080: Jenkins web UI (where you access Jenkins in browser)
# Port 50000: Jenkins agent communication (for distributed builds)
EXPOSE 8080 50000

# --------------------------------------------
# FINAL NOTE
# --------------------------------------------
# The CMD/ENTRYPOINT is inherited from the base jenkins/jenkins:lts image.
# It automatically starts Jenkins when the container runs.
# We don't need to specify it here.
