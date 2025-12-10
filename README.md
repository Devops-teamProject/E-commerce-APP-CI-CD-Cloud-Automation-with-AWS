# 🛒 E-commerce Application - Full Stack with CI/CD & Cloud Automation

<div align="center">

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![AWS](https://img.shields.io/badge/AWS-EKS-orange)
![Docker](https://img.shields.io/badge/Docker-Hub-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-blue)
![Security](https://img.shields.io/badge/Security-Scanned-green)

**A production-ready e-commerce platform with automated CI/CD pipeline, security scanning, and cloud deployment on AWS EKS**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [CI/CD Pipeline](#-cicd-pipeline) • [Documentation](#-documentation)

</div>

---
## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security](#-security)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## Overview

This project demonstrates a complete DevOps implementation for a modern e-commerce application. It showcases best practices in software development, security, containerization, orchestration, and cloud deployment.

### Key Highlights

- ✅ **Full Stack Application**: React frontend + Node.js backend + MongoDB
- ✅ **Complete CI/CD Pipeline**: GitHub Actions automation from code to cloud
- ✅ **Security First**: Integrated SAST (Semgrep) and vulnerability scanning (Trivy)
- ✅ **Cloud Native**: Deployed on AWS EKS with Kubernetes orchestration
- ✅ **Infrastructure as Code**: Terraform for AWS infrastructure provisioning
- ✅ **Container Ready**: Docker images with multi-stage builds
- ✅ **Production Ready**: Load balancing, auto-scaling, and high availability

---

## Features

### Application Features

- 🛍️ **Product Catalog**: Browse and search products
- 🛒 **Shopping Cart**: Add/remove items, update quantities
- 💳 **Checkout Process**: Secure payment integration
- 👤 **User Authentication**: Secure user registration and login
- 📦 **Order Management**: Track orders and history
- 📱 **Responsive Design**: Mobile-first approach

### DevOps Features

- 🔄 **Automated CI/CD**: Full automation from commit to deployment
- 🔒 **Security Scanning**: Code analysis and vulnerability detection
- 📊 **Comprehensive Reports**: Security findings in GitHub workflow summary
- 🐳 **Container Orchestration**: Kubernetes deployment with auto-scaling
- 🌐 **Cloud Infrastructure**: AWS EKS cluster with terraform
- 📈 **Scalability**: Horizontal pod autoscaling and load balancing
- 🔧 **Easy Configuration**: Environment-based settings

---

##  Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                       │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐     │
│  │   Frontend  │  │   Backend   │  │  Kubernetes Manifests│     │
│  │   (React)   │  │  (Node.js)  │  │       (YAML)         │     │
│  └─────────────┘  └─────────────┘  └──────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Push / Pull Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                         │
│                                                                 │
│   ┌──────────────┐    ┌──────────────┐     ┌──────────────┐     │
│   │   Security   │    │    Build     │     │    Deploy    │     │
│   │   Scanning   │    │   & Push     │     │   to EKS     │     │
│   │              │    │              │     │              │     │
│   │ • Semgrep    │    │ • Docker     │     │ • kubectl    │     │
│   │ • Trivy FS   │    │ • Trivy Image│     │ • AWS EKS    │     │
│   └──────────────┘    └──────────────┘     └──────────────┘     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Push Images
                                 ▼
                      ┌──────────────────────┐
                      │     Docker Hub       │
                      │                      │
                      │ • frontend:latest    │
                      │ • backend:latest     │
                      └──────────┬───────────┘
                                 │ Pull Images
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                            AWS Cloud                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Kubernetes Cluster                   │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │   Frontend   │  │   Backend    │  │   MongoDB    │   │    │
│  │  │  Namespace   │  │  Namespace   │  │  Namespace   │   │    │
│  │  │              │  │              │  │              │   │    │
│  │  │ • 2 Pods     │  │ • 2 Pods     │  │ • StatefulSet│   │    │
│  │  │ • Service    │  │ • Service    │  │ • PV/PVC     │   │    │
│  │  │ • Ingress    │  │ • Secrets    │  │ • ConfigMap  │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│    ┌───────────────────────────────────────────────────┐        │
│    │         Application Load Balancer (ALB)           │        │
│    └───────────────────────────────────────────────────┘        │  
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                           ┌─────────────┐
                           │    Users    │
                           └─────────────┘
```

### Component Interaction

```
┌──────────┐      HTTP/HTTPS      ┌──────────┐
│          │ ──────────────────────>│          │
│  Client  │                       │ Frontend │
│ (Browser)│ <──────────────────── │  (React) │
└──────────┘       Renders         └────┬─────┘
                                        │
                                        │ REST API
                                        │ (Fetch)
                                        ▼
                                   ┌────────┐
                                   │ Backend│
                                   │(Node.js│
                                   │Express)│
                                   └───┬────┘
                                       │
                                       │ MongoDB
                                       │ Protocol
                                       ▼
                                   ┌────────┐
                                   │MongoDB │
                                   │Database│
                                   └────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Webpack / Create React App
- **Styling**: CSS3, Material-UI / Bootstrap
- **State Management**: React Context / Redux
- **HTTP Client**: Axios / Fetch API

### Backend
- **Runtime**: Node.js 22.21.1
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **API**: RESTful API

### DevOps & Infrastructure
- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Container Registry**: Docker Hub
- **Orchestration**: Kubernetes (K8s)
- **Cloud Provider**: AWS (EKS, VPC, ALB)
- **Infrastructure as Code**: Terraform
- **Security Scanning**: Semgrep (SAST), Trivy (Vulnerability Scanner)
- **Monitoring**: CloudWatch (AWS)

---

## Project Structure

```

E-commerce-APP-CI-CD-Cloud-Automation-with-AWS/
│
├── .github/
│   └── workflows/
│       └── ci-my-app-ecoommerce.yml    # CI/CD pipeline configuration
│
├── ecommerce-frontend/                  # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── ecommerce-backend/                   # Node.js backend application
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── k8s/                                 # Kubernetes manifests
│   ├── namespaces/
│   │   ├── frontend-ns.yaml
│   │   ├── backend-ns.yaml
│   │   └── mongo-ns.yaml
│   │
│   ├── frontend/
│   │   ├── deploy.yml
│   │   ├── service.yml
│   │   └── ingress.yml
│   │
│   ├── backend/
│   │   ├── deploy.yml
│   │   ├── service.yml
│   │   └── secrets.yml
│   │
│   └── database/
│       ├── statefulset.yml
│       ├── pv.yml
│       ├── pvc.yml
│       ├── configmap.yml
│       └── secret.yml
│
├── terraform/                           # Infrastructure as Code
│   └── eks/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars
│
├── DOC/                                 # Additional documentation
│   └── [Documentation files]
│
├── docker-compose.yml                   # Local development setup
├── init-mongo.js                        # MongoDB initialization script
├── .gitignore
└── README.md                            # This file

```

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Local Development
- **Node.js**: v22.21.1 or higher
- **npm**: v10.x or higher
- **Docker**: Latest version
- **Docker Compose**: Latest version
- **Git**: Latest version

### Cloud Deployment
- **AWS Account**: With appropriate permissions
- **AWS CLI**: Configured with credentials
- **kubectl**: Latest version
- **Terraform**: v1.0 or higher (for infrastructure setup)

### GitHub Repository
- **GitHub Account**: With repository access
- **GitHub Secrets**: Configured (see Configuration section)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Devops-teamProject/E-commerce-APP-CI-CD-Cloud-Automation-with-AWS.git
cd E-commerce-APP-CI-CD-Cloud-Automation-with-AWS
```

### 2. Local Development with Docker Compose

```bash
# Start all services (frontend, backend, MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### 3. Manual Setup (Without Docker)

#### Backend Setup

```bash
cd ecommerce-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/ecommerce
# PORT=5000
# JWT_SECRET=your-secret-key

# Start backend
npm start
```

#### Frontend Setup

```bash
cd ecommerce-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend API URL
# REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```

### 4. MongoDB Setup

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongo-data:/data/db \
  mongo:latest

# Or use local MongoDB installation
# Make sure MongoDB service is running
sudo systemctl start mongodb
```

---

## CI/CD Pipeline

### Pipeline Overview

The GitHub Actions workflow automates the entire software delivery lifecycle:

```
┌───────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                    │
└───────────────────────────────┬───────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐              ┌──────▼───────┐
        │  Frontend Job  │              │ Backend Job  │
        │  (5-8 minutes) │              │(5-8 minutes) │
        └───────┬────────┘              └──────┬───────┘
                │ needs: none                  │ needs: frontend
                │                              │
        ┌───────▼────────────────────┐ ┌──────▼───────────────────┐
        │ 1. Code Checkout           │ │ 1. Code Checkout         │
        │ 2. Setup Node.js           │ │ 2. Setup Node.js         │
        │ 3. Install Dependencies    │ │ 3. Install Dependencies  │
        │ 4. Semgrep Security Scan   │ │ 4. Semgrep Security Scan │
        │ 5. Trivy Filesystem Scan   │ │ 5. Trivy Filesystem Scan │
        │ 6. Build Docker Image      │ │ 6. Build Docker Image    │
        │ 7. Trivy Image Scan        │ │ 7. Trivy Image Scan      │
        │ 8. Login to Docker Hub     │ │ 8. Login to Docker Hub   │
        │ 9. Push to Docker Hub      │ │ 9. Push to Docker Hub    │
        └────────────────────────────┘ └──────────────────────────┘
                                │
                                │ needs: backend
                                ▼
                        ┌───────────────┐
                        │  Deploy Job   │
                        │ (3-5 minutes) │
                        └───────┬───────┘
                                │
                    ┌───────────▼────────────┐
                    │ 1. AWS Configuration   │
                    │ 2. Update kubeconfig   │
                    │ 3. Deploy Namespaces   │
                    │ 4. Deploy Database     │
                    │ 5. Deploy Backend      │
                    │ 6. Deploy Frontend     │
                    │ 7. Verify Ingress      │
                    └────────────────────────┘
```

### Pipeline Stages Detailed

#### Stage 1: Frontend Job
- **Checkout Code**: Clone repository
- **Setup Environment**: Install Node.js 22.21.1
- **Install Dependencies**: Run `npm install`
- **Security Scans**:
  - Semgrep: Static code analysis
  - Trivy FS: Dependency vulnerability scan
- **Build**: Create Docker image
- **Image Scan**: Trivy container image scan
- **Push**: Upload to Docker Hub

#### Stage 2: Backend Job
- Same steps as frontend
- Depends on frontend job completion
- Different working directory: `./ecommerce-backend`

#### Stage 3: Deploy Job
- **AWS Configuration**: Setup AWS credentials
- **EKS Connection**: Update kubeconfig
- **Kubernetes Deployment**:
  - Create namespaces (frontend, backend, mongo-db)
  - Deploy MongoDB StatefulSet
  - Deploy backend service with 2 replicas
  - Deploy frontend service with 2 replicas
  - Configure Application Load Balancer
- **Verification**: Check ingress status

### Running the Pipeline

#### Manual Trigger (Current Setup)

1. Go to **Actions** tab in GitHub
2. Select workflow **"ci-the-app-app-ecomme"**
3. Click **"Run workflow"**
4. Select branch (usually `main`)
5. Click **"Run workflow"** button

#### Automatic Trigger (Optional)

To enable automatic runs on push to main:

```yaml
# In .github/workflows/ci-my-app-ecoommerce.yml
on:
  workflow_dispatch:
  push:
    branches:
      - main
```

### Pipeline Configuration

#### Required GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions → Secrets**

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKERHUB_PASSWORD` | Docker Hub access token | `dckr_pat_xyz...` |
| `aws_access_key_id` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `aws_secret_access_key` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/...` |

#### Required GitHub Variables

Navigate to: **Settings → Secrets and variables → Actions → Variables**

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub username | `osos3` |

---

## Security

### Security Scanning Tools

#### 1. Semgrep (SAST)
- **Type**: Static Application Security Testing
- **Purpose**: Analyze source code for security vulnerabilities
- **Detection**:
  - SQL injection
  - Cross-site scripting (XSS)
  - Hardcoded secrets
  - Insecure cryptography
  - Code quality issues

#### 2. Trivy Filesystem Scan
- **Type**: Dependency Vulnerability Scanner
- **Purpose**: Scan package dependencies
- **Detection**:
  - Vulnerable npm packages
  - Outdated dependencies
  - Known CVEs in libraries

#### 3. Trivy Image Scan
- **Type**: Container Image Scanner
- **Purpose**: Scan Docker images
- **Detection**:
  - Base image vulnerabilities
  - OS package issues
  - Application layer vulnerabilities

### Security Reports

After each pipeline run, view security findings:

1. Go to **Actions** tab
2. Select the workflow run
3. Click **"Summary"** tab
4. Review security scan results

**Report Format:**
```
## Semgrep Security Scan - Frontend
✅ No security issues found!

## Trivy Filesystem Scan - Backend
| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 5 |
| 🟡 Medium | 12 |
| 🟢 Low | 8 |
```

### Best Security Practices

✅ **DO:**
- Regularly update dependencies
- Review security scan reports
- Fix Critical/High vulnerabilities immediately
- Use environment variables for secrets
- Enable branch protection rules
- Rotate AWS credentials regularly

❌ **DON'T:**
- Commit secrets to repository
- Ignore security warnings
- Use outdated base images
- Skip security scans
- Use default passwords

---

## Deployment

### Infrastructure Setup with Terraform

#### 1. Configure AWS Credentials

```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

#### 2. Initialize Terraform

```bash
cd terraform/eks

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply
```

This creates:
- VPC with public/private subnets
- EKS cluster named `ecommerce-eks-cluster`
- Worker node groups
- Security groups
- IAM roles and policies

### Kubernetes Deployment

#### Manual Deployment

```bash
# Configure kubectl
aws eks --region us-east-1 update-kubeconfig --name ecommerce-eks-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes

# Deploy namespaces
kubectl apply -f k8s/namespaces/

# Deploy database
kubectl apply -f k8s/database/

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongo -n mongo-db --timeout=300s

# Deploy backend
kubectl apply -f k8s/backend/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Check deployment status
kubectl get pods -A
kubectl get services -A
kubectl get ingress -A
```

#### Verify Deployment

```bash
# Check pod status
kubectl get pods -n frontend
kubectl get pods -n backend
kubectl get pods -n mongo-db

# Check services
kubectl get svc -A

# Get Load Balancer URL
kubectl get ingress front-ingress -n frontend

# Expected output:
# NAME            CLASS   HOSTS   ADDRESS                                          PORTS   AGE
# front-ingress   nginx   *       k8s-frontend-xyz...elb.amazonaws.com             80      2m
```

### Accessing the Application

After deployment completes (2-5 minutes), access your application:

```bash
# Get the Load Balancer URL
INGRESS_URL=$(kubectl get ingress front-ingress -n frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Application URL: http://$INGRESS_URL"
```

Open the URL in your browser to access the e-commerce application.

### Scaling

#### Manual Scaling

```bash
# Scale frontend
kubectl scale deployment front-deploy --replicas=5 -n frontend

# Scale backend
kubectl scale deployment backend-deploy --replicas=5 -n backend
```

#### Auto-scaling (HPA)

```bash
# Create Horizontal Pod Autoscaler
kubectl autoscale deployment front-deploy --cpu-percent=70 --min=2 --max=10 -n frontend
kubectl autoscale deployment backend-deploy --cpu-percent=70 --min=2 --max=10 -n backend

# Check HPA status
kubectl get hpa -A
```

### Rollback

```bash
# View deployment history
kubectl rollout history deployment/front-deploy -n frontend

# Rollback to previous version
kubectl rollout undo deployment/front-deploy -n frontend

# Rollback to specific revision
kubectl rollout undo deployment/front-deploy --to-revision=2 -n frontend
```

---

## Monitoring

### Application Logs

```bash
# Frontend logs
kubectl logs -f deployment/front-deploy -n frontend

# Backend logs
kubectl logs -f deployment/backend-deploy -n backend

# MongoDB logs
kubectl logs -f statefulset/mongo-statefulset -n mongo-db

# View logs from all pods in a namespace
kubectl logs -l app=frontend -n frontend --tail=100
```

### Resource Monitoring

```bash
# Cluster resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -A

# Detailed pod information
kubectl describe pod <pod-name> -n <namespace>
```

### AWS CloudWatch

View metrics in AWS Console:
1. Go to **CloudWatch Dashboard**
2. Select **EKS Cluster Metrics**
3. Monitor:
   - CPU utilization
   - Memory usage
   - Network traffic
   - Pod count

---

## Documentation

### Additional Documentation

- **[CI/CD Pipeline Documentation](./README.md#-cicd-pipeline)**: Complete pipeline guide (this file)
- **[Frontend README](./ecommerce-frontend/README.md)**: Frontend-specific documentation
- **[Backend README](./ecommerce-backend/README.md)**: Backend API documentation
- **[DOC Folder](./DOC/)**:  documentation files

### API Documentation

Backend API endpoints:

```
GET    /api/products          # List all products
GET    /api/products/:id      # Get product by ID
POST   /api/products          # Create new product (Admin)
PUT    /api/products/:id      # Update product (Admin)
DELETE /api/products/:id      # Delete product (Admin)

POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/profile      # Get user profile

GET    /api/cart              # Get user cart
POST   /api/cart              # Add item to cart
PUT    /api/cart/:id          # Update cart item
DELETE /api/cart/:id          # Remove from cart

POST   /api/orders            # Create order
GET    /api/orders            # Get user orders
GET    /api/orders/:id        # Get order details
```

### Architecture Decisions

**Why These Technologies?**

- **React**: Modern, component-based UI framework
- **Node.js**: JavaScript runtime for fast, scalable backend
- **MongoDB**: NoSQL database for flexible data modeling
- **Docker**: Consistent environments across dev/staging/prod
- **Kubernetes**: Container orchestration with auto-scaling
- **AWS EKS**: Managed Kubernetes service, reducing operational overhead
- **GitHub Actions**: Native CI/CD with GitHub integration
- **Terraform**: Infrastructure as Code for reproducible deployments

---

##  Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/E-commerce-APP-CI-CD-Cloud-Automation-with-AWS.git
   cd E-commerce-APP-CI-CD-Cloud-Automation-with-AWS
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Go to original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

---

## Team

This project is developed and maintained by:

| Team Member    | GitHub                                           | 
|----------------|--------------------------------------------------|
| Ahmed Daoud    | [@AhmedMoDaoud](https://github.com/AhmedMoDaoud) | 
| Mahmoud Sallam | [@Mahmosallam](https://github.com/Mahmosallam)   | 
| Maged Naim     | [@Maged-Naim](https://github.com/Maged-Naim)     | 

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Thanks to all contributors who helped build this project
- Inspired by DevOps best practices and cloud-native architectures
- Built with modern tools and frameworks from the open-source community

---


##  Roadmap

### Current Version: v1.0

- ✅ Full stack e-commerce application
- ✅ Complete CI/CD pipeline with GitHub Actions
- ✅ Security scanning (Semgrep + Trivy)
- ✅ AWS EKS deployment with Kubernetes
- ✅ Infrastructure as Code with Terraform
- ✅ Auto-scaling and load balancing

### Future Enhancements (v2.0)

- 🔄 Implement Prometheus & Grafana monitoring
- 🔄 Add comprehensive test coverage (Jest, Cypress)
- 🔄 Integrate ArgoCD for GitOps workflow
- 🔄 Implement Istio service mesh
- 🔄 Add Elasticsearch for product search
- 🔄 Implement Redis for caching
- 🔄 Add Helm charts for easier deployment
- 🔄 Implement blue-green deployment strategy
- 🔄 Add SSL/TLS certificates with cert-manager
- 🔄 Implement advanced monitoring and alerting

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by DevOps Team Project

[Back to Top](#-e-commerce-application---full-stack-with-cicd--cloud-automation)

</div>