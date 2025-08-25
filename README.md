# 🛒 E-commerce APP CI/CD & Cloud Automation with AWS

## 📋 Abstract

This project delivers a complete **DevOps pipeline** for a small **E‑commerce application** on **Amazon Web Services (AWS)**. The application is containerized into microservices (frontend, catalog, orders, payments, users) and deployed on **EKS**. The infrastructure is fully automated with **Terraform**, covering VPC, EKS, RDS, ElastiCache, and ECR. **CI/CD pipelines** powered by **GitHub Actions** handle build, test, security scanning, and deployments. **Prometheus and Grafana** provide monitoring for both system performance and business KPIs like orders and payments.

---

## 🎯 Objectives

* Provision secure, scalable AWS infrastructure using **Terraform** (VPC, EKS, RDS, ElastiCache, ECR).
* Build a robust **CI/CD pipeline** with automated builds, tests, image scans, and deployments.
* Apply **containerization & orchestration best practices** with **Docker & Kubernetes (EKS)**.
* Implement **monitoring & observability** using Prometheus and Grafana.
* Adopt modern DevOps practices: **IaC**, **GitOps**, **DevSecOps**.
* Deliver a reproducible **Capstone-level DevOps project**.

---

## 🛠️ Technology Stack

| Category               | Tools                                       |
| ---------------------- | ------------------------------------------- |
| Cloud                  | AWS                                         |
| Infrastructure as Code | Terraform                                   |
| CI/CD                  | GitHub Actions                              |
| Containers             | Docker                                      |
| Orchestration          | Kubernetes (EKS)                            |
| Monitoring             | Prometheus, Grafana                         |
| Logging                | Fluent Bit + CloudWatch Logs                |
| Config Management      | Ansible                                     |
| Networking             | VPC, ALB, Security Groups, NAT              |
| Database & Cache       | RDS (PostgreSQL/MySQL), ElastiCache (Redis) |
| Registry               | ECR                                         |
| Security               | IAM, KMS, Secrets Manager                   |

---

## 📊 Architecture

**To be added later in `/docs/architecture.png`**

* **Public Subnets:** ALB, NAT Gateways.
* **Private Subnets:** EKS nodes, RDS, ElastiCache.
* **CI/CD:** GitHub Actions builds & pushes images to **ECR**, then deploys to **EKS**.
* **Monitoring:** Prometheus & Grafana for metrics and dashboards.
* **Secrets Management:** AWS Secrets Manager with CSI driver.

---

## 🗓️ Phased Plan (3 Months)

### Month 1 — Foundation & Development

* Set up GitHub repository & documentation.
* Implement app features: users, products, orders, payments.
* Write Dockerfiles + docker-compose for local testing.

### Month 2 — CI/CD & Kubernetes

* Set up GitHub Actions pipeline (build, test, scan, push images).
* Deploy app to **EKS** with Ingress & HPA.
* Configure blue/green or rolling deployments.

### Month 3 — Infra & Monitoring

* Provision infra with Terraform (VPC, RDS, EKS, ElastiCache).
* Set up Prometheus + Grafana dashboards.
* Implement logging with Fluent Bit + CloudWatch.
* Conduct load testing & finalize documentation.

---

## 📁 Project Structure

```
end-to-end-aws-devops-ecommerce/
├── .github/workflows/        # CI/CD pipelines
├── terraform/                # IaC for VPC, EKS, RDS, Redis, ECR
├── apps/                     # frontend + backend services
├── kubernetes/               # K8s manifests/Helm charts
├── ansible/                  # playbooks (optional)
├── docs/                     # architecture diagrams, dashboards
└── README.md
```

---

## 🚀 Deployment (High-Level)

1. `terraform apply` → Provision AWS infra (VPC, EKS, RDS, ElastiCache, ECR).
2. GitHub Actions → Build & push Docker images to ECR.
3. Deploy manifests/Helm charts → EKS.
4. Access frontend via ALB (HTTPS).
5. Monitor system & business KPIs via Grafana.

---

## ✅ Capstone Acceptance Criteria

* Reproducible infrastructure via Terraform.
* Automated CI/CD workflows (test, build, scan, deploy).
* Functional E-commerce flow: browse → cart → checkout → payment.
* Monitoring dashboards (system + business).
* Final documentation + demo presentation.

---

## 📄 License

MIT or choose another license.
