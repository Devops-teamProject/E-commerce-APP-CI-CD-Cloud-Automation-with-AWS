# 🚀 CI/CD Pipeline Documentation

Complete GitHub Actions CI/CD pipeline for automated build, security scanning, and deployment of the e-commerce application to AWS EKS.

## Table of Contents

- [Overview](#overview)
- [Pipeline Architecture](#pipeline-architecture)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Pipeline Stages](#pipeline-stages)
- [Security Scanning](#security-scanning)
- [Job Dependencies](#job-dependencies)
- [Triggers](#triggers)
- [GitHub Secrets & Variables](#github-secrets--variables)
- [Pipeline Execution](#pipeline-execution)
- [Reports & Outputs](#reports--outputs)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Customization](#customization)

---

## Overview

This GitHub Actions workflow automates the entire software delivery lifecycle:

- ✅ **Security Scanning**: SAST with Semgrep + vulnerability scanning with Trivy
- ✅ **Container Build**: Docker image creation for frontend and backend
- ✅ **Image Scanning**: Container vulnerability analysis
- ✅ **Registry Push**: Automated upload to Docker Hub
- ✅ **Kubernetes Deployment**: Automated deployment to AWS EKS
- ✅ **Detailed Reports**: Security findings in GitHub workflow summary

**Pipeline File**: `.github/workflows/ci-my-app-ecoommerce.yml`

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Workflow                      │
│                     (ci-my-app-ecoommerce.yml)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼─────────┐      ┌───────▼─────────┐
        │  Frontend Job   │      │  Backend Job    │
        │   (Parallel)    │      │  (needs: front) │
        └───────┬─────────┘      └───────┬─────────┘
                │                        │
        ┌───────▼─────────┐      ┌───────▼─────────┐
        │ 1. Semgrep      │      │ 1. Semgrep      │
        │ 2. Trivy FS     │      │ 2. Trivy FS     │
        │ 3. Docker Build │      │ 3. Docker Build │
        │ 4. Trivy Image  │      │ 4. Trivy Image  │
        │ 5. Push to Hub  │      │ 5. Push to Hub  │
        └───────┬─────────┘      └───────┬─────────┘
                │                        │
                └────────────┬───────────┘
                             │
                    ┌────────▼──────────┐
                    │   Deploy Job      │
                    │ (needs: backend)  │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │ 1. AWS Config     │
                    │ 2. Update kubeconf│
                    │ 3. Deploy NS      │
                    │ 4. Deploy DB      │
                    │ 5. Deploy Backend │
                    │ 6. Deploy Frontend│
                    │ 7. Verify Ingress │
                    └───────────────────┘
```

---

## Prerequisites

### GitHub Repository Setup

- [ ] Repository with frontend and backend code
- [ ] GitHub Actions enabled
- [ ] Secrets and variables configured

### External Services

- [ ] **Docker Hub Account**: For container registry
- [ ] **AWS Account**: With EKS cluster configured
- [ ] **EKS Cluster**: Named `ecommerce-eks-cluster` in `us-east-1`
- [ ] **kubectl Access**: GitHub runner can access cluster

### Tools & Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.21.1 | Application runtime |
| Semgrep | Latest | Static security analysis |
| Trivy | 0.33.1 | Vulnerability scanning |
| Docker | Latest | Container build |
| AWS CLI | Latest | EKS interaction |
| kubectl | Latest | Kubernetes deployment |

---

## Configuration

### File Location

```
.github/
└── workflows/
    └── ci-my-app-ecoommerce.yml
```

### Pipeline Name

```yaml
name: ci-the-app-app-ecomme
```

**Note**: You may want to rename this to something more descriptive like `E-commerce CI/CD Pipeline`

---

## Pipeline Stages

## Stage 1: Frontend Job

**Duration**: ~5-8 minutes  
**Runs on**: `ubuntu-latest`

### Steps Breakdown

#### 1. Checkout Code
```yaml
uses: actions/checkout@v6.0.0
```
- Clones repository to GitHub runner
- Gets latest commit from triggered branch

#### 2. Setup Node.js
```yaml
uses: actions/setup-node@v6.0.0
with:
  node-version: '22.21.1'
```
- Installs Node.js 22.21.1
- Required for npm dependencies

#### 3. Install Dependencies
```bash
working-directory: ./ecommerce-frontend
run: npm install
```
- Installs all npm packages
- Creates `node_modules/` directory

#### 4. Install Semgrep CLI
```bash
run: pip install semgrep
```
- Installs Semgrep security scanner
- Python package manager (pip) used

#### 5. Run Semgrep Scan
```bash
semgrep --config p/ci --json > semgrep-frontend.json || true
```
- **Config**: `p/ci` (general CI security ruleset)
- **Output**: JSON format for parsing
- **`|| true`**: Prevents pipeline failure on findings

**What Semgrep Detects:**
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting)
- Hardcoded secrets
- Insecure cryptography
- Code quality issues

#### 6. Format Semgrep Report
```bash
RESULTS=$(jq '.results | length' semgrep-frontend.json)
ERRORS=$(jq '.errors | length' semgrep-frontend.json)
```
- Parses JSON results
- Counts issues found
- Displays in GitHub Summary

#### 7. Trivy Dependency Scan
```yaml
uses: aquasecurity/trivy-action@0.33.1
with:
  scan-type: fs
  scan-ref: ./ecommerce-frontend
  format: json
  output: trivy-fs-frontend.json
```
- **Scan Type**: Filesystem (checks package.json, package-lock.json)
- **Detects**: Known CVEs in npm packages

**What Trivy FS Detects:**
- Vulnerable npm packages
- Outdated dependencies
- Known security issues in libraries

#### 8. Format Trivy FS Report
```bash
VULNS=$(jq '[.Results[]?.Vulnerabilities // [] | length] | add // 0' trivy-fs-frontend.json)
CRITICAL=$(jq '[.Results[]?.Vulnerabilities // [] | .[] | select(.Severity=="CRITICAL")] | length' trivy-fs-frontend.json)
```
- Counts vulnerabilities by severity
- Creates formatted table

**Severity Levels:**
- 🔴 **CRITICAL**: Immediate action required
- 🟠 **HIGH**: Should be fixed soon
- 🟡 **MEDIUM**: Should be addressed
- 🟢 **LOW**: Minor issues

#### 9. Build Docker Image
```bash
docker build -t ${{ vars.DOCKERHUB_USERNAME }}/front:latest ./ecommerce-frontend/.
```
- Builds container image
- Tags as `latest`
- Uses Dockerfile in frontend directory

#### 10. Trivy Docker Image Scan
```yaml
uses: aquasecurity/trivy-action@0.33.1
with:
  scan-type: image
  image-ref: ${{ vars.DOCKERHUB_USERNAME }}/front:latest
```
- Scans built Docker image
- Checks base image + application layers

**What Trivy Image Detects:**
- OS package vulnerabilities
- Application dependency issues
- Misconfigurations

#### 11. Format Trivy Image Report
```bash
jq -r '[.Results[]?.Vulnerabilities // [] | .[] | select(.Severity=="CRITICAL" or .Severity=="HIGH")] | sort_by(.Severity) | reverse | limit(5;.[]) | "| \(.VulnerabilityID) | \(.Severity) | \(.PkgName) | \(.FixedVersion // "N/A") |"'
```
- Shows top 5 Critical/High vulnerabilities
- Displays CVE ID, severity, package, fix version

#### 12. Login to Docker Hub
```yaml
uses: docker/login-action@v3.6.0
with:
  username: ${{ vars.DOCKERHUB_USERNAME }}
  password: ${{ secrets.DOCKERHUB_PASSWORD }}
```
- Authenticates with Docker Hub
- Required before pushing images

#### 13. Push Docker Image
```bash
docker push ${{ vars.DOCKERHUB_USERNAME }}/front:latest
```
- Uploads image to Docker Hub
- Available for Kubernetes deployment

#### 14. Frontend Summary
```bash
echo "## ✅ Frontend Pipeline Complete" >> $GITHUB_STEP_SUMMARY
```
- Adds completion message to workflow summary

---

## Stage 2: Backend Job

**Duration**: ~5-8 minutes  
**Runs on**: `ubuntu-latest`  
**Depends on**: Frontend job completion

### Dependency Declaration
```yaml
needs: frontend
```
- Waits for frontend job to complete
- Ensures sequential execution

### Steps

Identical to frontend job, but with different working directory:

1. Checkout Code
2. Setup Node.js 22.21.1
3. Install Dependencies (`./ecommerce-backend`)
4. Install Semgrep CLI
5. Run Semgrep Scan (`semgrep-backend.json`)
6. Format Semgrep Report
7. Trivy Dependency Scan (`./ecommerce-backend`)
8. Format Trivy FS Report
9. Build Docker Image (`back:latest`)
10. Trivy Docker Image Scan
11. Format Trivy Image Report
12. Login to Docker Hub
13. Push Docker Image
14. Backend Summary
15. **Final Summary** (overall pipeline status)

---

## Stage 3: Deploy Job

**Duration**: ~3-5 minutes  
**Runs on**: `ubuntu-latest`  
**Depends on**: Backend job completion

### Environment Variables
```yaml
env:
  AWS_REGION: us-east-1
  CLUSTER_NAME: ecommerce-eks-cluster
```

### Steps Breakdown

#### 1. Checkout Code
```yaml
uses: actions/checkout@v6.0.0
```
- Gets Kubernetes manifest files

#### 2. Configure AWS Credentials
```yaml
uses: aws-actions/configure-aws-credentials@v5.1.0
with:
  aws-access-key-id: ${{ secrets.aws_access_key_id }}
  aws-secret-access-key: ${{ secrets.aws_secret_access_key }}
  aws-region: ${{ env.AWS_REGION }}
```
- Authenticates with AWS
- Sets up AWS CLI
- Required for EKS access

#### 3. Update kubeconfig
```bash
aws eks --region $AWS_REGION update-kubeconfig --name $CLUSTER_NAME
```
- Configures kubectl to access EKS cluster
- Downloads cluster credentials

#### 4. Deploy Namespaces
```bash
kubectl apply -f k8s/namespaces/.
```
- Creates: `frontend`, `backend`, `mongo-db` namespaces

#### 5. Deploy Database
```bash
kubectl apply -f k8s/database/.
```
- Deploys MongoDB StatefulSet
- Creates PersistentVolume, ConfigMap, Secret
- Usually takes 30-60 seconds to be ready

#### 6. Deploy Backend
```bash
kubectl apply -f k8s/backend/.
```
- Deploys backend API pods (2 replicas)
- Creates service and secrets
- Init container waits for MongoDB

#### 7. Deploy Frontend
```bash
kubectl apply -f k8s/frontend/.
```
- Deploys frontend pods (2 replicas)
- Creates service and ingress
- Init container checks backend readiness

#### 8. Get Ingress Info
```bash
sleep 60
kubectl get ingress -n frontend
```
- Waits for ALB provisioning
- Displays Load Balancer URL
- Takes ~2 minutes for AWS to create ALB

---

## Security Scanning

### Semgrep (SAST - Static Application Security Testing)

**Type**: Static Code Analysis  
**Speed**: Fast (~30 seconds)  
**Coverage**: Source code

#### Configuration
```bash
semgrep --config p/ci
```

**Ruleset `p/ci` includes:**
- Security vulnerabilities
- Code quality issues
- Best practice violations
- Framework-specific checks

#### Example Findings
```
- SQL Injection in database query
- Hardcoded API key in config file
- Weak cryptographic algorithm usage
- Missing input validation
```

#### Report Format
```markdown
## Semgrep Security Scan - Frontend

| Metric | Count |
|--------|-------|
| Issues Found | 3 |
| Errors | 0 |
```

---

### Trivy Filesystem Scan

**Type**: Dependency Vulnerability Scanning  
**Speed**: Fast (~1-2 minutes)  
**Coverage**: package.json, package-lock.json

#### What It Scans
```
ecommerce-frontend/
├── package.json           ← Scanned
├── package-lock.json      ← Scanned
└── node_modules/          ← Analyzed
```

#### Example Vulnerabilities
```
- CVE-2023-45133: babel-traverse <7.23.2
- CVE-2023-26136: tough-cookie <4.1.3
- CVE-2024-29180: webpack-dev-middleware <5.3.4
```

#### Report Format
```markdown
## Trivy Filesystem Scan - Frontend

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 5 |
| 🟡 Medium | 12 |
| 🟢 Low | 8 |

**Total Vulnerabilities:** 27
```

---

### Trivy Image Scan

**Type**: Container Image Vulnerability Scanning  
**Speed**: Medium (~2-3 minutes)  
**Coverage**: Base image + application layers

#### What It Scans
```
Docker Image Layers:
├── Base OS (e.g., node:22-alpine)     ← System packages
├── System packages                     ← apt/apk packages
├── Application files                   ← Your code
└── npm dependencies                    ← node_modules
```

#### Example Findings
```
Base Image (node:22-alpine):
- CVE-2024-1234: openssl 3.0.8 → 3.0.9
- CVE-2024-5678: busybox 1.35.0 → 1.36.0

Application Layer:
- CVE-2023-45133: babel-traverse (npm)
```

#### Report Format
```markdown
## Trivy Image Scan - Frontend

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 3 |
| 🟡 Medium | 15 |
| 🟢 Low | 22 |

**Total Vulnerabilities:** 41

<details>
<summary>🔎 View Top Critical/High Vulnerabilities</summary>

| CVE | Severity | Package | Fixed Version |
|-----|----------|---------|---------------|
| CVE-2024-1234 | CRITICAL | openssl | 3.0.9 |
| CVE-2023-5678 | HIGH | libssl3 | 3.0.9-r2 |
| CVE-2023-9012 | HIGH | babel-traverse | 7.23.2 |
</details>
```

---

## 🔗 Job Dependencies

### Sequential Execution Flow

```
Frontend Job (no dependencies)
    ↓ (needs: frontend)
Backend Job (waits for frontend)
    ↓ (needs: backend)
Deploy Job (waits for backend)
```

### Why This Order?

1. **Frontend First**
   - Can run independently
   - Usually lighter build
   - Detects issues early

2. **Backend Second**
   - Similar to frontend
   - Both can be parallelized in future
   - Currently sequential for resource management

3. **Deploy Last**
   - Needs both images in Docker Hub
   - Deploys all components together
   - Ensures consistency

### Parallelization Option

To run frontend and backend in parallel:

```yaml
backend:
  needs: []  # Remove or comment out this line
```

**Trade-offs:**
- ✅ Faster total pipeline time
- ✅ Better resource utilization
- ❌ Uses more GitHub Actions minutes
- ❌ More complex to debug failures

---

## 🎯 Triggers

### Current Configuration

```yaml
on:
  workflow_dispatch:
  # push:
  #   branches:
  #   - main
```

### Workflow Dispatch (Manual)

**Currently Active** ✅

Allows manual pipeline execution:

1. Go to **Actions** tab in GitHub
2. Select workflow "ci-the-app-app-ecomme"
3. Click **Run workflow**
4. Select branch
5. Click **Run workflow** button

**Use Cases:**
- Testing pipeline changes
- Manual deployments
- Controlled releases

---

### Push Trigger (Commented Out)

**Currently Inactive** ❌

To enable automatic runs on push to main:

```yaml
on:
  workflow_dispatch:
  push:
    branches:
    - main
```

**When Enabled:**
- Triggers on every commit to `main`
- Fully automated CI/CD
- No manual intervention needed

---

### Other Trigger Options

#### Pull Request Trigger
```yaml
on:
  pull_request:
    branches:
    - main
```
- Runs on PR creation/update
- Good for pre-merge validation

#### Schedule Trigger
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```
- Regular security scans
- Dependency updates check

#### Tag/Release Trigger
```yaml
on:
  push:
    tags:
    - 'v*'  # v1.0.0, v1.0.1, etc.
```
- Production releases
- Version-based deployments

---

## GitHub Secrets & Variables

### Required Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `DOCKERHUB_PASSWORD` | Docker Hub access token or password | [Docker Hub](https://hub.docker.com/settings/security) → Create Access Token |
| `aws_access_key_id` | AWS IAM access key | AWS Console → IAM → Users → Security Credentials |
| `aws_secret_access_key` | AWS IAM secret key | Created with access key (copy immediately) |

#### Creating Docker Hub Token

```bash
1. Login to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Name: "github-actions"
5. Permissions: Read, Write, Delete
6. Copy token (shown once!)
```

#### Creating AWS IAM User

```bash
1. AWS Console → IAM → Users
2. Create user: "github-actions-deploy"
3. Attach policies:
   - AmazonEKSClusterPolicy
   - AmazonEKSWorkerNodePolicy
   - AmazonEKS_CNI_Policy
4. Security credentials → Create access key
5. Use case: "Application running outside AWS"
6. Copy Access Key ID and Secret Access Key
```

---

### Required Variables

Navigate to: **Repository Settings → Secrets and variables → Actions → Variables tab**

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `osos3` |

---

### Testing Secrets Configuration

```yaml
# Add this step temporarily to verify secrets
- name: Test Secrets
  run: |
    echo "Docker Hub user: ${{ vars.DOCKERHUB_USERNAME }}"
    echo "AWS Access Key: ${AWS_KEY:0:4}****"
  env:
    AWS_KEY: ${{ secrets.aws_access_key_id }}
```

**⚠️ Never echo actual secret values!**

---

## Pipeline Execution

### Starting the Pipeline

#### Method 1: Manual Trigger (Current Setup)

```
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "ci-the-app-app-ecomme" workflow
4. Click "Run workflow" button
5. Select branch (usually 'main')
6. Click "Run workflow"
```

#### Method 2: Git Push (When Enabled)

```bash
git add .
git commit -m "Update application"
git push origin main
```

---

### Monitoring Execution

#### Real-time Monitoring

```
Actions → Select workflow run → Watch live logs
```

**What to Watch:**
- Green checkmarks ✅ = Step completed
- Yellow spinning = Step in progress
- Red X ❌ = Step failed

#### Viewing Logs

```
Click on any job → Click on any step → View detailed logs
```

**Useful for:**
- Debugging failures
- Understanding what happened
- Checking security scan results

---

### Execution Time

| Job | Average Duration |
|-----|------------------|
| Frontend | 5-8 minutes |
| Backend | 5-8 minutes |
| Deploy | 3-5 minutes |
| **Total** | **13-21 minutes** |

**Factors Affecting Time:**
- npm install speed
- Docker build cache
- Security scan findings
- AWS ALB creation

---

## Reports & Outputs

### GitHub Workflow Summary

After pipeline completion, view summary:

```
Actions → Select workflow run → Summary tab
```

### Report Sections

#### 1. Semgrep Security Scan
```markdown
## Semgrep Security Scan - Frontend
✅ **No security issues found!**

## Semgrep Security Scan - Backend
| Metric | Count |
|--------|-------|
| Issues Found | 2 |
| Errors | 0 |
```

#### 2. Trivy Filesystem Scan
```markdown
## Trivy Filesystem Scan - Frontend
| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 2 |
| 🟡 Medium | 5 |
| 🟢 Low | 10 |

**Total Vulnerabilities:** 17
```

#### 3. Trivy Image Scan
```markdown
## Trivy Image Scan - Backend
| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 4 |
| 🟡 Medium | 12 |
| 🟢 Low | 25 |

**Total Vulnerabilities:** 42

<details>
<summary>🔎 View Top Critical/High Vulnerabilities</summary>

| CVE | Severity | Package | Fixed Version |
|-----|----------|---------|---------------|
| CVE-2024-1234 | CRITICAL | openssl | 3.0.9 |
| CVE-2023-5678 | HIGH | libssl3 | 3.0.9-r2 |
</details>
```

#### 4. Pipeline Complete
```markdown
---
## ✅ Frontend Pipeline Complete
Image: `osos3/front:latest`

---
## ✅ Backend Pipeline Complete
Image: `osos3/back:latest`

---
# 🎉 CI/CD Pipeline Complete!

Both frontend and backend have been successfully built, scanned, and deployed.

**Deployed Images:**
- Frontend: `osos3/front:latest`
- Backend: `osos3/back:latest`
```

---

### Downloading Scan Reports

Scan results are saved as artifacts (in JSON format):

```
Actions → Workflow run → Scroll to bottom → Artifacts section
```

**Available Artifacts:**
- `semgrep-frontend.json`
- `semgrep-backend.json`
- `trivy-fs-frontend.json`
- `trivy-fs-backend.json`
- `trivy-image-frontend.json`
- `trivy-image-backend.json`

**Note**: Current configuration doesn't upload artifacts. To enable:

```yaml
- name: Upload Trivy Results
  uses: actions/upload-artifact@v3
  with:
    name: trivy-results
    path: |
      trivy-*.json
      semgrep-*.json
```

---

## Troubleshooting

### Common Issues

#### 1. Pipeline Fails at npm install

**Error:**
```
npm ERR! code ENOTFOUND
npm ERR! network request to https://registry.npmjs.org/package failed
```

**Solution:**
```yaml
# Add retry logic
- name: Install Dependencies
  run: |
    npm install --retry 3 --network-timeout 60000
```

---

#### 2. Docker Build Fails

**Error:**
```
Error: Cannot find module '/app/server.js'
```

**Solutions:**
- Check Dockerfile COPY paths
- Verify working-directory matches
- Ensure package.json exists
- Check .dockerignore file

---

#### 3. Docker Hub Push Fails

**Error:**
```
denied: requested access to the resource is denied
```

**Solutions:**
```bash
# Verify secrets are set
echo "${{ secrets.DOCKERHUB_PASSWORD }}" | docker login -u "${{ vars.DOCKERHUB_USERNAME }}" --password-stdin

# Check token permissions (must have write access)
# Regenerate token if needed
```

---

#### 4. AWS Authentication Fails

**Error:**
```
An error occurred (AccessDenied) when calling the DescribeCluster operation
```

**Solutions:**
- Verify AWS secrets are correct
- Check IAM user has EKS permissions
- Ensure cluster name matches
- Verify region is correct

```yaml
# Test AWS access
- name: Test AWS Access
  run: |
    aws sts get-caller-identity
    aws eks describe-cluster --name ${{ env.CLUSTER_NAME }} --region ${{ env.AWS_REGION }}
```

---

#### 5. Kubectl Apply Fails

**Error:**
```
error: unable to recognize "k8s/frontend/deploy.yml": no matches for kind "Deployment"
```

**Solutions:**
- Verify kubeconfig was updated
- Check YAML syntax
- Ensure files exist in correct paths
- Verify cluster API version

```bash
# Debug kubectl
- name: Debug Kubernetes
  run: |
    kubectl version
    kubectl cluster-info
    kubectl get nodes
```

---

#### 6. High Severity Vulnerabilities Block Pipeline

**Current Behavior**: Pipeline continues even with vulnerabilities (`|| true`)

**To Make Pipeline Fail on High/Critical:**

```yaml
- name: Run Trivy Image Scan
  uses: aquasecurity/trivy-action@0.33.1
  with:
    scan-type: image
    image-ref: ${{ vars.DOCKERHUB_USERNAME }}/front:latest
    exit-code: '1'  # Fail on vulnerabilities
    severity: 'CRITICAL,HIGH'  # Only these severities
```

---

#### 7. Ingress Not Ready After Deploy

**Issue**: Pipeline completes but ALB not accessible

**Solutions:**
```yaml
# Increase wait time
- name: Wait for Ingress
  run: |
    echo "Waiting for ALB provisioning..."
    sleep 120  # Increase from 60 to 120 seconds
    
    # Add retry logic
    for i in {1..10}; do
      INGRESS_STATUS=$(kubectl get ingress front-ingress -n frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
      if [ ! -z "$INGRESS_STATUS" ]; then
        echo "✅ Ingress ready: $INGRESS_STATUS"
        break
      fi
      echo "⏳ Waiting for ingress... (attempt $i/10)"
      sleep 30
    done
```

---

### Debug Mode

Enable debug logging:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

Add to workflow file to see detailed logs.

---

## Best Practices

### 1. Security

✅ **DO:**
- Use GitHub Secrets for sensitive data
- Rotate AWS credentials regularly
- Use Docker Hub access tokens (not password)
- Scan both code and images
- Review security reports

❌ **DON'T:**
- Hardcode credentials in workflow
- Echo secret values in logs
- Skip security scans
- Ignore Critical/High vulnerabilities

---

### 2. Performance

✅ **DO:**
- Use caching for npm modules
- Leverage Docker layer caching
- Parallelize independent jobs
- Clean up old images

**Example - Add npm Cache:**
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

---

### 3. Reliability

✅ **DO:**
- Pin action versions (`@v6.0.0`)
- Add retry logic for network operations
- Validate prerequisites before deploy
- Implement rollback on failure

**Example - Rollback:**
```yaml
- name: Deploy with Rollback
  run: |
    kubectl apply -f k8s/backend/ || {
      echo "Deployment failed, rolling back..."
      kubectl rollout undo deployment/backend-deploy -n backend
      exit 1
    }
```

---

### 4. Monitoring

✅ **DO:**
- Check workflow summary after each run
- Set up notifications for failures
- Track deployment success rate
- Monitor pipeline duration

**Example - Slack Notification:**
```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Customization

### Change Docker Image Tags

Instead of `latest`, use version tags:

```yaml
# Use commit SHA
- name: Build Docker Image
  run: |
    docker build -t ${{ vars.DOCKERHUB_USERNAME }}/front:${{ github.sha }} ./ecommerce-frontend/.
    docker push ${{ vars.DOCKERHUB_USERNAME }}/front:${{ github.sha }}
```

---

### Add More Security Scanners

#### Snyk Integration
```yaml
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### OWASP Dependency Check
```yaml
- name: OWASP Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'ecommerce-frontend'
    path: '.'
    format: 'HTML'
```

---

### Multi-Environment Deployment

```yaml
deploy-staging:
  needs: backend
  if