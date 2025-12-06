# =========================================================================
# variables.tf - Input Variables
# =========================================================================


# -------------------------------------------------------------------------
# AWS Region Configuration
# -------------------------------------------------------------------------
variable "region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}


# -------------------------------------------------------------------------
# EKS Cluster Configuration
# -------------------------------------------------------------------------
# Kubernetes version to use for the EKS cluster
variable "cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.30"
  
}
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "ecommerce-eks-cluster"
  
}

# -------------------------------------------------------------------------
# Node Group Configuration
# -------------------------------------------------------------------------
# EC2 instance types for worker nodes

variable "node_instance_types" {
  description = "Instance types for EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
  
}

# Desired number of nodes at cluster creation
variable "node_desired_size" {
  description = "Desired number of nodes in the node group"
  type        = number
  default     = 2

  # Validation: Must be between min and max
  validation {
    condition     = var.node_desired_size >= 1 && var.node_desired_size <= 10  # Limit to control costs 
    error_message = "Desired size must be between 1 and 10."
  }
}

# Minimum number of nodes (for auto-scaling)
variable "node_min_size" {
  description = "Minimum number of nodes in the node group" 
  type        = number
  default     = 2

  validation {
    condition     = var.node_min_size >= 1
    error_message = "Minimum size must be at least 1."
  }
}

# Maximum number of nodes (for auto-scaling)
variable "node_max_size" {
  description = "Maximum number of nodes in the node group"
  type        = number
  default     = 3

  validation {
    condition     = var.node_max_size >= 1 && var.node_max_size <= 5  # Limit to control costs
    error_message = "Maximum size must be between 1 and 5."
  }
}

# -------------------------------------------------------------------------
# VPC Networking Configuration
# -------------------------------------------------------------------------
# VPC CIDR block: Defines the IP address range for your VPC
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.10.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))               # Validation: Ensure it's a valid CIDR block        
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

# Availability Zones: Physical data center locations

variable "availability_zones" {
  description = "Availability zones for VPC subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
  
}

# Public subnet CIDR blocks
variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.10.1.0/24", "10.10.2.0/24"]
  
}

# Private subnet CIDR blocks
variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.10.3.0/24", "10.10.4.0/24"]
  
}
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnet internet access"
  type        = bool
  default     = true
  
}
variable "single_nat_gateway" {
  description = "Use single NAT Gateway to save costs (all private subnets share it)"
  type        = bool
  default     = true
  
}

# -------------------------------------------------------------------------
# IAM Configuration
# -------------------------------------------------------------------------

# ARN of the IAM user/role to grant admin access to EKS cluster
variable "admin_user_arn" {
  description = "ARN of the IAM user to grant admin access to EKS cluster"
  type        = string
  default     = "arn:aws:iam::737427925739:user/Admin-terraform"
  
}

variable "admin_user_arn_github_actions" {
  description = "ARN of the IAM role for GitHub Actions to grant admin access to EKS cluster"
  type        = string
  default     = "arn:aws:iam::737427925739:user/Github-action"

}

# -------------------------------------------------------------------------
# Application Configuration
# -------------------------------------------------------------------------
# Version of AWS Load Balancer Controller Helm chart

variable "alb_controller_version" {
  description = "Version of AWS Load Balancer Controller Helm chart"
  type        = string
  default     = "1.8.1"
}

# -------------------------------------------------------------------------
# Tagging Configuration
# -------------------------------------------------------------------------
# Environment name: Used for tagging resources
variable "environment" {
  description = "Environment name (e.g., Dev, Staging, Production)"
  type        = string
  default     = "Dev"

  # Validation: Only allow specific environment names

  validation {
    condition     = contains(["Dev", "Staging", "Production"], var.environment)
    error_message = "Environment must be Dev, Staging, or Production."
  }
}

# Project name: Used for tagging and resource naming

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "ECOMMERCE-EKS"
}
