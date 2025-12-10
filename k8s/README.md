# ☸️ Kubernetes Deployment Guide

Complete Kubernetes manifests for deploying a microservices e-commerce application on AWS EKS.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Configuration](#detailed-configuration)
- [Namespace Organization](#namespace-organization)
- [Database Layer](#database-layer)
- [Backend Layer](#backend-layer)
- [Frontend Layer](#frontend-layer)
- [Networking](#networking)
- [Storage](#storage)
- [Secrets Management](#secrets-management)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Overview

This Kubernetes configuration deploys a three-tier application:
- **Frontend**: React application (2 replicas)
- **Backend**: Node.js API (2 replicas)
- **Database**: MongoDB StatefulSet with persistent storage

**Key Features:**
- ✅ Multi-namespace isolation
- ✅ Persistent storage with AWS EBS
- ✅ Health checks and readiness probes
- ✅ Init containers for dependency management
- ✅ AWS Application Load Balancer integration
- ✅ Resource limits and requests
- ✅ Secrets management

---

## Architecture

```
                    ┌──────────────────────────────┐
                    │  AWS Application Load        │
                    │  Balancer (Internet-facing)  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │     Ingress Controller       │
                    │    (front-ingress)           │
                    └──────────────┬───────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┼─────────────────────────┐
        │                          │                          │                         │
        │                          │                          │                         │ 
        │    Frontend Namespace    │    Backend Namespace     │    Mongo-DB Namespace   │
        │                          │                          │                         │
        │  ┌────────────────────┐  │  ┌────────────────────┐  │  ┌──────────────────┐   │
        │  │ Frontend Deployment│  │  │ Backend Deployment │  │  │ MongoDB          │   │
        │  │   (Replicas: 2)    │  │  │   (Replicas: 2)    │  │  │ StatefulSet      │   │
        │  │                    │  │  │                    │  │  │ (Replicas: 1)    │   │
        │  │  Port: 8080        │◄─┼──┤  Port: 5000        │ ◄┼──┤ Port: 27017      │   │
        │  │                    │  │  │                    │  │  │                  │   │
        │  │  Init: Check       │  │  │  Init: Wait for    │  │  │ PersistentVolume │   │
        │  │  Backend Ready     │  │  │  MongoDB           │  │  │ (AWS EBS 5Gi)    │   │
        │  └────────────────────┘  │  └────────────────────┘  │  └──────────────────┘   │ 
        │                          │                          │                         │ 
        │  Service: NodePort       │  Service: ClusterIP      │  Service: Headless      │
        │  (front-svc)             │  (backend-svc)           │  (mongo-svc)            │
        └──────────────────────────┴──────────────────────────┴─────────────────────────┘
```

---

## Directory Structure

```
k8s/
├── namespaces/                 # Namespace definitions
│   ├── ns-front.yml           # Frontend namespace
│   ├── ns-back.yml            # Backend namespace
│   └── ns-db.yml              # Database namespace
│
├── database/                   # MongoDB configuration
│   ├── statefull.yml          # StatefulSet for MongoDB
│   ├── svc.yml                # Headless service
│   ├── pv.yml                 # PersistentVolume (AWS EBS)
│   ├── sc.yml                 # StorageClass (gp2)
│   ├── config-map.yml         # Initialization scripts
│   └── secret.yml             # Root credentials
│
├── backend/                    # Backend API configuration
│   ├── deploy.yml             # Deployment manifest
│   ├── db-svc.yml             # ClusterIP service
│   └── secret.yml             # Application secrets
│
└── frontend/                   # Frontend configuration
    ├── deploy.yml             # Deployment manifest
    ├── svc.yml                # NodePort service
    ├── ingress.yml            # ALB Ingress
    └── secret.yml             # Frontend environment vars
```

---

## Prerequisites

### Required Tools
- `kubectl` (v1.24+)
- `aws-cli` (v2.x)
- AWS EKS cluster running
- AWS Load Balancer Controller installed

### AWS Resources Needed
- **EKS Cluster**: `ecommerce-eks-cluster`
- **EBS Volume**: 5GB gp2 volume in `us-east-1a`
- **IAM Roles**: EKS node role with EBS access
- **VPC**: With proper subnets and security groups

### Pre-Installation Steps

```bash
# 1. Configure AWS CLI
aws configure

# 2. Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name ecommerce-eks-cluster

# 3. Verify cluster access
kubectl cluster-info

# 4. Create EBS volume for MongoDB
aws ec2 create-volume \
  --availability-zone us-east-1a \
  --size 5 \
  --volume-type gp2 \
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=mongo-pv-1},{Key=app,Value=mongo},{Key=instance,Value=mongo-0}]'

# Note the VolumeId (e.g., vol-0a126c942619bb86f) and update in pv.yml
```

---

## Quick Start

### One-Command Deployment

```bash
# Deploy everything in order
kubectl apply -f k8s/namespaces/ && \
kubectl apply -f k8s/database/ && \
kubectl wait --for=condition=ready pod -l app=mongo -n mongo-db --timeout=300s && \
kubectl apply -f k8s/backend/ && \
kubectl wait --for=condition=ready pod -l app=backend -n backend --timeout=300s && \
kubectl apply -f k8s/frontend/
```

### Step-by-Step Deployment

```bash
# 1. Create namespaces
kubectl apply -f k8s/namespaces/

# 2. Deploy MongoDB
kubectl apply -f k8s/database/

# 3. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongo -n mongo-db --timeout=300s

# 4. Verify MongoDB is running
kubectl get pods -n mongo-db
kubectl logs mongo-0 -n mongo-db

# 5. Deploy Backend
kubectl apply -f k8s/backend/

# 6. Wait for Backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n backend --timeout=300s

# 7. Verify Backend is running
kubectl get pods -n backend

# 8. Deploy Frontend
kubectl apply -f k8s/frontend/

# 9. Wait for Ingress (ALB provisioning takes ~2 minutes)
sleep 120

# 10. Get the application URL
kubectl get ingress -n frontend
```

### Access the Application

```bash
# Get the Load Balancer URL
INGRESS_URL=$(kubectl get ingress front-ingress -n frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$INGRESS_URL"
```

---

## 🔧 Detailed Configuration

## Namespace Organization

### Three Isolated Namespaces

#### 1. Frontend Namespace (`ns-front.yml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: frontend
```
**Purpose**: Isolates frontend pods, services, and ingress resources

#### 2. Backend Namespace (`ns-back.yml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: backend
```
**Purpose**: Isolates backend API pods and internal services

#### 3. Database Namespace (`ns-db.yml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mongo-db
```
**Purpose**: Isolates database StatefulSet and storage resources

**Benefits:**
- Security isolation
- Resource quota management
- RBAC per namespace
- Easier management and organization

---

## Database Layer

### StatefulSet Configuration (`statefull.yml`)

```yaml
Key Specifications:
- Replicas: 1
- Image: mongo:6
- Port: 27017
- Service: Headless (mongo-svc)
- Storage: 5Gi AWS EBS
- Zone: us-east-1a (nodeSelector)
```

**Features:**
- ✅ Persistent storage with PVC
- ✅ Init scripts via ConfigMap
- ✅ Health checks (TCP probes)
- ✅ Resource limits
- ✅ Automatic user creation

### Storage Configuration

#### PersistentVolume (`pv.yml`)
```yaml
Specifications:
- Capacity: 5Gi
- Access Mode: ReadWriteOnce
- Reclaim Policy: Retain
- Storage Class: gp2-retain
- AWS EBS Volume ID: vol-0a126c942619bb86f (update this!)
- Label Selector: app=mongo, instance=mongo-0
```

**Important**: Update `volumeID` with your actual EBS volume ID:
```bash
# Get your volume ID
aws ec2 describe-volumes --filters "Name=tag:Name,Values=mongo-pv-1"
```

#### StorageClass (`sc.yml`)
```yaml
Specifications:
- Provisioner: kubernetes.io/aws-ebs
- Type: gp2
- Reclaim Policy: Retain
- Volume Binding: WaitForFirstConsumer
```

### Initialization Script (`config-map.yml`)

Automatically creates application user on first startup:

```javascript
db = db.getSiblingDB('ecommerce');
db.createUser({
  user: "appuser",
  pwd: "apppassword",
  roles: [{ role: "readWrite", db: "ecommerce" }]
});
```

### Secrets (`database/secret.yml`)

```yaml
MONGO_INITDB_ROOT_USERNAME: admin
MONGO_INITDB_ROOT_PASSWORD: StrongRootPass123  # ⚠️ Change this!
```

### Service (`svc.yml`)

Headless service for stable network identity:
```yaml
Type: ClusterIP: None (Headless)
Port: 27017
DNS: mongo-svc.mongo-db.svc.cluster.local
```

### Resource Limits

```yaml
requests:
  cpu: 100m
  memory: 256Mi
limits:
  cpu: 500m
  memory: 1Gi
```

### Health Checks

```yaml
readinessProbe:
  tcpSocket:
    port: 27017
  initialDelaySeconds: 10
  periodSeconds: 10

livenessProbe:
  tcpSocket:
    port: 27017
  initialDelaySeconds: 30
  periodSeconds: 20
```

---

## Backend Layer

### Deployment Configuration (`backend/deploy.yml`)

```yaml
Key Specifications:
- Replicas: 2 (High Availability)
- Image: osos3/back:latest
- Port: 5000
- Service: ClusterIP
```

### Init Container

Waits for MongoDB to be ready before starting:

```yaml
initContainers:
  - name: wait-for-mongo
    image: mongo:6
    command: ["sh", "-c"]
    args:
      - until mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"; do
          sleep 3;
        done;
```

**Purpose**: Ensures database is fully operational before backend starts

### Environment Variables (`backend/secret.yml`)

```yaml
MONGODB_URI: mongodb://appuser:apppassword@mongo-svc.mongo-db.svc.cluster.local:27017/ecommerce?authSource=ecommerce
JWT_SECRET: f830c3db...958  # ⚠️ Generate new secret!
FRONTEND_URL: http://front-svc.frontend.svc.cluster.local:8080
PORT: 5000
```

**Generate JWT Secret:**
```bash
openssl rand -hex 64
```

### Service (`backend/db-svc.yml`)

```yaml
Type: ClusterIP (Internal only)
Port: 5000
DNS: backend-svc.backend.svc.cluster.local
```

### Resource Limits

```yaml
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 900m
  memory: 356Mi
```

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 20
  periodSeconds: 10
```

---

## Frontend Layer

### Deployment Configuration (`frontend/deploy.yml`)

```yaml
Key Specifications:
- Replicas: 2
- Image: osos3/front:latest
- Port: 8080
- Service: NodePort
```

### Init Container

Checks backend availability before starting:

```yaml
initContainers:
  - name: check-backend
    image: curlimages/curl:8.2.1
    command:
      - sh
      - -c
      - until curl -s http://backend-svc.backend.svc.cluster.local:5000/health/ready; do
          sleep 3;
        done
```

### Environment Variables (`frontend/secret.yml`)

```yaml
BACKEND_HOST: backend-svc.backend.svc.cluster.local
BACKEND_PORT: 5000
```

### Service (`frontend/svc.yml`)

```yaml
Type: NodePort
Port: 8080
Target Port: 8080
DNS: front-svc.frontend.svc.cluster.local
```

### Resource Limits

```yaml
requests:
  cpu: 100m
  memory: 128Mi
limits:
  cpu: 250m
  memory: 256Mi
```

### Health Checks

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## Networking

### Ingress Configuration (`frontend/ingress.yml`)

#### AWS Application Load Balancer

```yaml
Annotations:
- kubernetes.io/ingress.class: alb
- alb.ingress.kubernetes.io/scheme: internet-facing
- alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80}]'

Specifications:
- IngressClassName: alb
- Path: / (all traffic)
- Backend: front-svc:8080
- PathType: Prefix
```

### Service Types Explained

| Service | Type | Purpose | Access |
|---------|------|---------|--------|
| `mongo-svc` | Headless | StatefulSet stable identity | Internal only |
| `backend-svc` | ClusterIP | Internal API communication | Internal only |
| `front-svc` | NodePort | Expose to Ingress | Via Ingress |

### Cross-Namespace Communication

Services can communicate across namespaces using FQDN:

```bash
# Backend to Database
mongodb://mongo-svc.mongo-db.svc.cluster.local:27017

# Frontend to Backend
http://backend-svc.backend.svc.cluster.local:5000

# Format: <service>.<namespace>.svc.cluster.local
```

---

## Storage

### Storage Architecture

```
┌────────────────────────────────────────┐
│         AWS EBS Volume                 │
│         (gp2, 5GB, us-east-1a)         │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│      PersistentVolume (PV)             │
│      - Retain policy                   │
│      - Label: app=mongo, instance=0    │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│  PersistentVolumeClaim (PVC)           │
│  (Created by StatefulSet)              │
│  - Name: mongo-data-mongo-0            │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│         MongoDB Pod                    │
│         Mount: /data/db                │
└────────────────────────────────────────┘
```

### Storage Class Details

```yaml
Name: gp2-retain
Provisioner: kubernetes.io/aws-ebs
Parameters:
  - type: gp2 (General Purpose SSD)
Reclaim Policy: Retain (data survives pod deletion)
Volume Binding: WaitForFirstConsumer (binds when pod scheduled)
```

### Verifying Storage

```bash
# Check PersistentVolume
kubectl get pv

# Check PersistentVolumeClaim
kubectl get pvc -n mongo-db

# Check if bound
kubectl describe pvc mongo-data-mongo-0 -n mongo-db

# Verify EBS volume in AWS
aws ec2 describe-volumes --volume-ids vol-0a126c942619bb86f
```

---

## Secrets Management

### Database Secrets

**Location**: `k8s/database/secret.yml`

```yaml
Contents:
- MONGO_INITDB_ROOT_USERNAME: Root admin username
- MONGO_INITDB_ROOT_PASSWORD: Root admin password
```

**Usage**: MongoDB container initialization

### Backend Secrets

**Location**: `k8s/backend/secret.yml`

```yaml
Contents:
- MONGODB_URI: Full connection string
- JWT_SECRET: Token signing secret
- FRONTEND_URL: CORS configuration
- PORT: Application port
```

**Usage**: Backend application environment variables

### Frontend Secrets

**Location**: `k8s/frontend/secret.yml`

```yaml
Contents:
- BACKEND_HOST: Backend service hostname
- BACKEND_PORT: Backend service port
```

**Usage**: Frontend API configuration

### Best Practices

⚠️ **Security Recommendations:**

1. **Never commit secrets to Git**
   ```bash
   # Add to .gitignore
   **/secret.yml
   ```

2. **Use external secret management**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Sealed Secrets

3. **Encode secrets properly**
   ```bash
   echo -n "mypassword" | base64
   ```

4. **Rotate secrets regularly**
   ```bash
   kubectl create secret generic backend-secret \
     --from-literal=JWT_SECRET=$(openssl rand -hex 64) \
     --dry-run=client -o yaml | kubectl apply -f -
   ```

---

## Health Checks

### Probe Types

| Probe Type | Purpose | Behavior |
|------------|---------|----------|
| **Liveness** | Detect if pod is alive | Restart pod if fails |
| **Readiness** | Detect if pod is ready | Remove from service if fails |

### Backend Health Endpoints

Must implement these endpoints in your backend:

```javascript
// Liveness: Check if application is running
GET /health/live
Response: 200 OK

// Readiness: Check if ready to serve traffic (DB connected)
GET /health/ready
Response: 200 OK
```

### MongoDB Health Checks

```yaml
TCP socket check on port 27017:
- No HTTP endpoint needed
- Checks if MongoDB port is accepting connections
```

### Testing Health Checks

```bash
# Test backend liveness from another pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://backend-svc.backend.svc.cluster.local:5000/health/live

# Test backend readiness
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://backend-svc.backend.svc.cluster.local:5000/health/ready

# Check MongoDB connectivity
kubectl run -it --rm debug --image=mongo:6 --restart=Never -- \
  mongosh "mongodb://appuser:apppassword@mongo-svc.mongo-db.svc.cluster.local:27017/ecommerce?authSource=ecommerce" \
  --eval "db.adminCommand('ping')"
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Pods Not Starting

```bash
# Check pod status
kubectl get pods -n <namespace>

# Describe pod for events
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace>

# Check previous container logs (if crashed)
kubectl logs <pod-name> -n <namespace> --previous
```

#### 2. Init Container Stuck

```bash
# Check init container logs
kubectl logs <pod-name> -n <namespace> -c <init-container-name>

# Example: Check backend waiting for MongoDB
kubectl logs <backend-pod> -n backend -c wait-for-mongo

# Example: Check frontend waiting for backend
kubectl logs <frontend-pod> -n frontend -c check-backend
```

#### 3. PersistentVolume Not Binding

```bash
# Check PV status
kubectl get pv

# Check PVC status
kubectl get pvc -n mongo-db

# Describe PVC for events
kubectl describe pvc mongo-data-mongo-0 -n mongo-db

# Common causes:
# - Wrong availability zone (must be us-east-1a)
# - Volume ID doesn't exist
# - Label selector mismatch
# - Node not in same zone as EBS volume
```

**Fix availability zone mismatch:**
```bash
# Check node zones
kubectl get nodes -o custom-columns=NAME:.metadata.name,ZONE:.metadata.labels.topology\\.kubernetes\\.io/zone

# If needed, recreate EBS volume in correct zone
aws ec2 create-volume --availability-zone <correct-zone> --size 5 --volume-type gp2
```

#### 4. MongoDB Connection Issues

```bash
# Check MongoDB pod
kubectl get pods -n mongo-db

# Check MongoDB logs
kubectl logs mongo-0 -n mongo-db

# Test connection from backend pod
kubectl exec -it <backend-pod> -n backend -- sh

# Inside pod:
mongosh "mongodb://appuser:apppassword@mongo-svc.mongo-db.svc.cluster.local:27017/ecommerce?authSource=ecommerce"
```

**Common causes:**
- Incorrect credentials in secret
- MongoDB not fully initialized
- Init script failed
- Network policy blocking traffic

#### 5. Backend API Not Responding

```bash
# Check backend pods
kubectl get pods -n backend

# Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://backend-svc.backend.svc.cluster.local:5000/health/ready

# Check backend logs
kubectl logs -f <backend-pod> -n backend

# Verify environment variables
kubectl exec <backend-pod> -n backend -- env | grep MONGODB_URI
```

#### 6. Ingress/ALB Not Working

```bash
# Check ingress status
kubectl get ingress -n frontend

# Describe ingress for events
kubectl describe ingress front-ingress -n frontend

# Check ALB controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail=100

# Verify ALB in AWS console
aws elbv2 describe-load-balancers
```

**Common causes:**
- ALB controller not installed
- Insufficient IAM permissions
- Subnets not properly tagged
- Security group issues

#### 7. High Memory/CPU Usage

```bash
# Check resource usage
kubectl top pods -n <namespace>

# Check events for OOMKilled
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Increase resource limits in deployment
kubectl edit deployment <deployment-name> -n <namespace>
```

### Debugging Commands Cheat Sheet

```bash
# Get all resources in namespace
kubectl get all -n <namespace>

# Watch pod status in real-time
kubectl get pods -n <namespace> -w

# Execute commands inside pod
kubectl exec -it <pod-name> -n <namespace> -- /bin/sh

# Port forward for local testing
kubectl port-forward -n frontend svc/front-svc 8080:8080

# Copy files from pod
kubectl cp <namespace>/<pod-name>:/path/to/file ./local-file

# Get pod YAML
kubectl get pod <pod-name> -n <namespace> -o yaml

# Check resource quotas
kubectl describe resourcequota -n <namespace>

# View cluster events
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

### Cleanup & Reset

```bash
# Delete everything (careful!)
kubectl delete -f k8s/frontend/
kubectl delete -f k8s/backend/
kubectl delete -f k8s/database/
kubectl delete -f k8s/namespaces/

# Force delete stuck namespace
kubectl get namespace <namespace> -o json | jq '.spec.finalizers = []' | kubectl replace --raw "/api/v1/namespaces/<namespace>/finalize" -f -

# Delete PV manually if stuck
kubectl patch pv <pv-name> -p '{"metadata":{"finalizers":null}}'
```

---

## Additional Resources

### Kubernetes Documentation
- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

### AWS Documentation
- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [EBS CSI Driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html)

### Best Practices
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Production Checklist](https://learnk8s.io/production-best-practices)
- [Security Best Practices](https://kubernetes.io/docs/concepts/security/overview/)

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check pod resource usage
- Review logs for errors
- Verify all health checks passing

**Monthly:**
- Update Docker images to latest versions
- Review and rotate secrets
- Check for unused PersistentVolumes
- Update resource limits based on metrics

**Quarterly:**
- Review security policies
- Audit IAM permissions
- Test disaster recovery procedures
- Update Kubernetes version

---

## Important Notes

1. **EBS Volume ID**: Must be updated in `pv.yml` with your actual volume ID
2. **Secrets**: Change all default passwords before production use
3. **Zone Affinity**: MongoDB pod must run in `us-east-1a` (same as EBS volume)
4. **Docker Images**: Update image names (`osos3/front:latest`, `osos3/back:latest`) to your registry
5. **JWT Secret**: Generate a new random secret for production
6. **Resource Limits**: Adjust based on your application's actual needs
7. **Backup Strategy**: Implement regular MongoDB backups
8. **Monitoring**: Add monitoring solution (Prometheus/Grafana) for production

---