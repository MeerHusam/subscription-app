// ============================================
// JENKINSFILE - CI/CD Pipeline Definition
// ============================================

pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'subscription-app'
        BACKEND_IMAGE = 'subscription-app-backend'
        FRONTEND_IMAGE = 'subscription-app-frontend'
        BACKEND_PATH = './backend'
        FRONTEND_PATH = './frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Checking out code from repository...'
                checkout scm
                echo '✅ Code checkout complete'
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo "🔨 Building Backend..."
                    dir(BACKEND_PATH) {
                        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ."
                    }

                    // IMPORTANT: docker-compose.yml uses :latest
                    // So we must update :latest to point to the newly built backend image
                    sh "docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy Dev') {
            environment {
                ENV_NAME = 'dev'
                BACKEND_PORT = '8001'
                FRONTEND_PORT = '5001'
                DB_PORT = '5433'
                IMAGE_TAG = "${BUILD_NUMBER}"
            }
            steps {
                echo "🚀 Deploying to Development..."
                script {
                    echo "🔨 Building Frontend for Dev..."
                    dir(FRONTEND_PATH) {
                        sh """docker build --no-cache \
                            --build-arg VITE_API_BASE_URL="/api" \
                            --build-arg VITE_ENV_NAME="Development" \
                            -t ${FRONTEND_IMAGE}:${BUILD_NUMBER}-dev ."""
                    }

                    // Retag dev build to build number tag (optional but consistent with your existing flow)
                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER}-dev ${FRONTEND_IMAGE}:${BUILD_NUMBER}"

                    // IMPORTANT: docker-compose.yml uses :latest
                    // So we must update :latest to point to this newly built frontend image
                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest"

                    // Deploy
                    sh "docker compose -p ${COMPOSE_PROJECT_NAME}-${ENV_NAME} up -d --force-recreate"
                }

                echo "✅ Dev successfully deployed at http://localhost:${FRONTEND_PORT}"
            }
        }

        stage('Promote to QA') {
            steps {
                input message: 'Promote build to QA Environment?', ok: 'Promote'
            }
        }

        stage('Deploy QA') {
            environment {
                ENV_NAME = 'qa'
                BACKEND_PORT = '8002'
                FRONTEND_PORT = '5002'
                DB_PORT = '5434'
                IMAGE_TAG = "${BUILD_NUMBER}"
            }
            steps {
                echo "🚀 Deploying to QA..."
                script {
                    echo "🔨 Building Frontend for QA..."
                    dir(FRONTEND_PATH) {
                        sh """docker build --no-cache \
                            --build-arg VITE_API_BASE_URL="/api" \
                            --build-arg VITE_ENV_NAME="QA" \
                            -t ${FRONTEND_IMAGE}:${BUILD_NUMBER}-qa ."""
                    }

                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER}-qa ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest"

                    sh "docker compose -p ${COMPOSE_PROJECT_NAME}-${ENV_NAME} up -d --force-recreate"
                }
                echo "✅ QA successfully deployed at http://localhost:${FRONTEND_PORT}"
            }
        }

        stage('Test Backend') {
            steps {
                echo '🧪 Running backend tests...'
                script {
                    echo '⏭️  Backend tests skipped - configure when ready'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                echo '🧪 Running frontend tests...'
                script {
                    echo '⏭️  Frontend tests skipped - configure when ready'
                }
            }
        }

        stage('Promote to Production') {
            steps {
                input message: 'Promote build to PRODUCTION?', ok: 'Deploy to Prod'
            }
        }

        stage('Deploy Production') {
            environment {
                ENV_NAME = 'prod'
                BACKEND_PORT = '8003'
                FRONTEND_PORT = '5003'
                DB_PORT = '5435'
                IMAGE_TAG = "${BUILD_NUMBER}"
            }
            steps {
                echo "🚀 Deploying to Production..."
                script {
                    echo "🔨 Building Frontend for Production..."
                    dir(FRONTEND_PATH) {
                        sh """docker build --no-cache \
                            --build-arg VITE_API_BASE_URL="/api" \
                            --build-arg VITE_ENV_NAME="Production" \
                            -t ${FRONTEND_IMAGE}:${BUILD_NUMBER}-prod ."""
                    }

                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER}-prod ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    sh "docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest"

                    sh "docker compose -p ${COMPOSE_PROJECT_NAME}-${ENV_NAME} up -d --force-recreate"
                }
                echo "✅ Production successfully deployed at http://localhost:${FRONTEND_PORT}"
            }
        }

        stage('Push to Registry') {
            when { branch 'main' }
            steps {
                echo '📤 Pushing images to Docker registry...'
                script {
                    echo '⏭️  Registry push skipped - configure when ready'
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old Docker images...'
                script {
                    sh 'docker image prune -f'
                }
                echo '✅ Cleanup complete'
            }
        }
    }

    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline completed successfully!'
            echo '✅ ========================================='
            echo "📦 Backend image: ${BACKEND_IMAGE}:${BUILD_NUMBER} (and :latest updated)"
            echo "📦 Frontend image: ${FRONTEND_IMAGE}:${BUILD_NUMBER} (and :latest updated)"
            echo '✅ ========================================='
        }
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline failed!'
            echo '❌ Check the logs above for details'
            echo '❌ ========================================='
        }
        always {
            echo '🏁 Pipeline execution finished'
        }
    }
}
