// ============================================
// JENKINSFILE - CI/CD Pipeline Definition
// ============================================
// Purpose: Define the automated build process
// This file tells Jenkins WHAT to do when code changes

// --------------------------------------------
// PIPELINE DECLARATION
// --------------------------------------------
// 'pipeline' block defines a declarative pipeline
// This is the modern, recommended way to write Jenkins pipelines
pipeline {
    
    // --------------------------------------------
    // AGENT
    // --------------------------------------------
    // 'agent any' means "run this pipeline on any available Jenkins agent"
    // Since we only have one Jenkins server, it runs there
    agent any
    
    // --------------------------------------------
    // ENVIRONMENT VARIABLES
    // --------------------------------------------
    // Define variables used throughout the pipeline
    // These make it easy to change names/settings in one place
    environment {
        // App Name and Images
        COMPOSE_PROJECT_NAME = 'subscription-app'
        // Docker image names for your app
        BACKEND_IMAGE = 'subscription-app-backend'
        FRONTEND_IMAGE = 'subscription-app-frontend'
        
        // Optional: Docker registry configuration
        // Uncomment these when you want to push to Docker Hub or private registry
        // DOCKER_REGISTRY = 'your-registry.com'
        // DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        
        // Paths to your code
        BACKEND_PATH = './backend'
        FRONTEND_PATH = './frontend'
    }
    
    // --------------------------------------------
    // STAGES
    // --------------------------------------------
    // The pipeline is divided into stages
    // Each stage appears as a separate box in Jenkins UI
    stages {
        
        // ========================================
        // STAGE 1: CHECKOUT
        // ========================================
        // Pull the latest code from Git
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from repository...'
                
                // 'checkout scm' pulls code from the configured Git repo
                // SCM = Source Code Management (Git, in our case)
                checkout scm
                
                echo '✅ Code checkout complete'
            }
        }
        
        // ========================================
        // STAGE 2: BUILD BACKEND
        // ========================================
        // Build the Django backend Docker image
        // ========================================
        // STAGE 2: BUILD BACKEND
        // ========================================
        stage('Build Backend') {
            steps {
                script {
                    echo "🔨 Building Backend..."
                    dir(BACKEND_PATH) {
                        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ."
                    }
                }
            }
        }

        // ========================================
        // STAGE 3: DEPLOY DEVELOPMENT
        // ========================================
        stage('Deploy Dev') {
            environment {
                // Dev Environment Config
                ENV_NAME = 'dev'
                BACKEND_PORT = '8001'
                FRONTEND_PORT = '5001'
                DB_PORT = '5433'
                IMAGE_TAG = "${BUILD_NUMBER}"
            }
            steps {
                echo "🚀 Deploying to Development (simulated)..."
                script {
                    // 1. Build Frontend specifically for DEV (baking in the Dev backend URL)
                    echo "🔨 Building Frontend for Dev..."
                    dir(FRONTEND_PATH) {
                        sh "docker build --build-arg VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}/api -t ${FRONTEND_IMAGE}:${BUILD_NUMBER}-dev ."
                    }

                    // 2. Deploy using Docker Compose
                    // We must tell compose which project name (-p) to use so they don't conflict
                    withEnv(["IMAGE_TAG=${BUILD_NUMBER}"]) {
                         // We will re-tag our custom dev image to what compose expects for this specific run context
                         sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER}-dev ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                         
                         sh "docker compose -p ${COMPOSE_PROJECT_NAME}-${ENV_NAME} up -d"
                    }
                }
                echo "✅ Dev successfully deployed at http://localhost:${FRONTEND_PORT}"
            }
        }
        
        // ========================================
        // STAGE 4: PROMOTE TO QA
        // ========================================
        stage('Promote to QA') {
            steps {
                input message: 'Promote build to QA Environment?', ok: 'Promote'
            }
        }

        // ========================================
        // STAGE 5: DEPLOY QA
        // ========================================
        stage('Deploy QA') {
            environment {
                // QA Environment Config
                ENV_NAME = 'qa'
                BACKEND_PORT = '8002'
                FRONTEND_PORT = '5002'
                DB_PORT = '5434'
                IMAGE_TAG = "${BUILD_NUMBER}"
            }
            steps {
                echo "🚀 Deploying to QA..."
                script {
                    // 1. Build Frontend specifically for QA (baking in the QA backend URL)
                    echo "🔨 Building Frontend for QA..."
                    dir(FRONTEND_PATH) {
                        sh "docker build --build-arg VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}/api -t ${FRONTEND_IMAGE}:${BUILD_NUMBER}-qa ."
                    }

                    // 2. Deploy using Docker Compose
                    withEnv(["IMAGE_TAG=${BUILD_NUMBER}"]) {
                         sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER}-qa ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                         sh "docker compose -p ${COMPOSE_PROJECT_NAME}-${ENV_NAME} up -d"
                    }
                }
                echo "✅ QA successfully deployed at http://localhost:${FRONTEND_PORT}"
            }
        }
            steps {
                echo '🧪 Running backend tests...'
                
                script {
                    // Uncomment this when you have tests configured:
                    // 
                    // sh """
                    //     docker run --rm ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                    //     python manage.py test
                    // """
                    
                    // For now, just skip
                    echo '⏭️  Backend tests skipped - configure when ready'
                }
            }
        
        // ========================================
        // STAGE 5: TEST FRONTEND (Optional)
        // ========================================
        // Run React tests
        // Currently skipped - uncomment when you have tests
        stage('Test Frontend') {
            steps {
                echo '🧪 Running frontend tests...'
                
                script {
                    // Uncomment this when you have tests configured:
                    // 
                    // sh """
                    //     docker run --rm ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    //     npm test -- --watchAll=false
                    // """
                    
                    // For now, just skip
                    echo '⏭️  Frontend tests skipped - configure when ready'
                }
            }
        }
        
        // ========================================
        // STAGE 6: PUSH TO REGISTRY (Optional)
        // ========================================
        // Push images to Docker Hub or private registry
        // Only runs on 'main' branch
        stage('Push to Registry') {
            // Conditional execution: only run on main branch
            when {
                branch 'main'
            }
            
            steps {
                echo '📤 Pushing images to Docker registry...'
                
                script {
                    // Uncomment when you want to push to a registry:
                    // 
                    // docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                    //     sh """
                    //         docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                    //         docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    //         docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                    //         docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    //     """
                    // }
                    
                    // For now, just skip
                    echo '⏭️  Registry push skipped - configure when ready'
                }
            }
        }
        
        // ========================================
        // STAGE 7: CLEANUP
        // ========================================
        // Remove old/unused Docker images to save disk space
        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old Docker images...'
                
                script {
                    // Remove dangling images (untagged images from previous builds)
                    sh 'docker image prune -f'
                }
                
                echo '✅ Cleanup complete'
            }
        }
    }
    
    // --------------------------------------------
    // POST ACTIONS
    // --------------------------------------------
    // Actions to run after the pipeline completes
    // Runs regardless of success or failure
    post {
        // Run if pipeline succeeds
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline completed successfully!'
            echo '✅ ========================================='
            echo "📦 Backend image: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "📦 Frontend image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo '✅ ========================================='
        }
        
        // Run if pipeline fails
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline failed!'
            echo '❌ Check the logs above for details'
            echo '❌ ========================================='
        }
        
        // Always run (success or failure)
        always {
            echo '🏁 Pipeline execution finished'
        }
    }
}

// ============================================
// WHAT HAPPENS WHEN THIS RUNS
// ============================================
// 1. Jenkins pulls your latest code from Git
// 2. Builds backend Docker image (tagged with build number)
// 3. Builds frontend Docker image (tagged with build number)
// 4. (Optional) Runs tests
// 5. (Optional) Pushes to Docker registry
// 6. Cleans up old images
// 7. Shows success/failure message
//
// Result: Fresh Docker images ready to deploy!
// ============================================
