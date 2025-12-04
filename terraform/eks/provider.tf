terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}
provider "kubernetes" {
  config_path = "~/.kube/config"  
  host                   = data.aws_eks_cluster.eks_admin.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks_admin.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.eks_admin.token
  #load_config_file       = false
}
provider "helm" {
  kubernetes = {
    config_path = "~/.kube/config"
    host                   = data.aws_eks_cluster.eks_admin.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks_admin.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.eks_admin.token

  }
}

