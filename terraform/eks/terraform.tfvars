# =========================================================================
# terraform.tfvars - Variable Values
# =========================================================================
# This file contains the actual values for variables defined in variables.tf
# 

# =========================================================================

# -------------------------------------------------------------------------
# AWS Region Configuration
# -------------------------------------------------------------------------
# The AWS region where all resources will be created

region = "us-east-1"

# -------------------------------------------------------------------------
# EKS Cluster Configuration
# -------------------------------------------------------------------------
# Kubernetes version for the EKS cluster

cluster_version = "1.30"

# -------------------------------------------------------------------------
# Node Group Configuration
# -------------------------------------------------------------------------
# EC2 instance types for worker nodes

node_instance_types = ["t3.medium"]

# Number of nodes
node_desired_size = 2  # Starting number of nodes
node_min_size     = 2  # Minimum for high availability
node_max_size     = 4  # Maximum for auto-scaling

# -------------------------------------------------------------------------
# VPC Networking Configuration
# -------------------------------------------------------------------------
# VPC CIDR block - adjust if conflicts with existing networks

vpc_cidr = "10.10.0.0/16"

# Availability zones - must be available in your region

availability_zones = ["us-east-1a", "us-east-1b"]

# Public subnets - for load balancers and NAT gateways

public_subnet_cidrs = ["10.10.1.0/24", "10.10.2.0/24"]

# Private subnets - for EKS worker nodes

private_subnet_cidrs = ["10.10.3.0/24", "10.10.4.0/24"]

# -------------------------------------------------------------------------
# NAT Gateway Configuration
# -------------------------------------------------------------------------
# Enable NAT Gateway for private subnet internet access

enable_nat_gateway = true

# Use single NAT Gateway to save costs.

single_nat_gateway = true

# -------------------------------------------------------------------------
# IAM Configuration
# -------------------------------------------------------------------------
# IMPORTANT: Replace with your actual IAM user/role ARN.

admin_user_arn = "arn:aws:iam::737427925739:user/Admin-terraform"

# -------------------------------------------------------------------------
# Application Configuration
# -------------------------------------------------------------------------
# AWS Load Balancer Controller Helm chart version

alb_controller_version = "1.8.1"

# -------------------------------------------------------------------------
# Tagging Configuration
# -------------------------------------------------------------------------
# Environment name - used for resource tagging

environment = "Dev"  

# Project name 

project_name = "ECOMMERCE-EKS"
# =========================================================================