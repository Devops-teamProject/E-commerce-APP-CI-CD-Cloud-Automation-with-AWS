# =========================================================================
# providers.tf - Provider Configuration
# =========================================================================

# -------------------------------------------------------------------------
# Terraform Configuration Block
# -------------------------------------------------------------------------
# Defines minimum Terraform version and required providers with versions
terraform {
  required_version = ">= 1.5.0"
  required_providers {
                            aws = {
                              source  = "hashicorp/aws"  # Official AWS provider
                              version = "~> 5.0"         # Use any 5.x version (allows minor updates)
                            }
                            
                            kubernetes = {
                              source  = "hashicorp/kubernetes"  # Official Kubernetes provider
                              version = "~> 2.23"  # Use any 2.23.x version
                            }
                            
                            helm = {
                              source  = "hashicorp/helm"    # Official Helm provider
                              version = "~> 2.11"  # Use any 2.11.x version
                            }
                            
                            http = {
                              source  = "hashicorp/http"    # Official HTTP provider
                              version = "~> 3.4"
                            } 
  }

  backend "s3" {
    bucket         = "terraform-state-file-depi"       # S3 bucket name
    key            = "eks/terraform.tfstate"           # Path to state file
    region         = "us-east-1"                       # S3 bucket region
    encrypt        = true                              # Encrypt state file
    dynamodb_table = "terraform-state-lock-depi"       # For state locking
  }

}
# -------------------------------------------------------------------------
# AWS Provider Configuration
# -------------------------------------------------------------------------
# Configures how Terraform connects to AWS
provider "aws" {
  region = var.region  

  default_tags {
    tags = {
      ManagedBy   = "Terraform"      # Indicates this is IaC
      Environment = var.environment             # Environment name
      Project     = var.project_name  # Project identifier
    }
  }
}

# -------------------------------------------------------------------------
# Kubernetes Provider Configuration
# -------------------------------------------------------------------------
# Configures how Terraform connects to the EKS cluster

provider "kubernetes" {

  host = data.aws_eks_cluster.eks_admin.endpoint # EKS API server URL
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks_admin.certificate_authority[0].data) # Cluster CA cert for secure TLS connection
  token = data.aws_eks_cluster_auth.eks_admin.token # Auth token for API access
  
}

# -------------------------------------------------------------------------
# Helm Provider Configuration
# -------------------------------------------------------------------------
# Configures how Terraform deploys Helm charts to the EKS cluster

provider "helm" {
  kubernetes {

    host = data.aws_eks_cluster.eks_admin.endpoint  # EKS API server URL
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks_admin.certificate_authority[0].data) # Cluster CA cert for secure TLS connection
    token = data.aws_eks_cluster_auth.eks_admin.token # Auth token for API access
  }
}
