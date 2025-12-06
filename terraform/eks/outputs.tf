# =========================================================================
# outputs.tf - Output Values
# =========================================================================
# This file defines what information Terraform displays after creating resources

# =========================================================================
# EKS CLUSTER OUTPUTS
# =========================================================================
# Cluster name: Used for kubectl configuration and AWS CLI commands
output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name

}

# Cluster endpoint: The URL where kubectl sends API requests
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"       # kubectl uses this URL to communicate with cluster
  value       = module.eks.cluster_endpoint
  
}

# Kubernetes version: What version of K8s is running
output "cluster_version" {
  description = "Kubernetes version of the EKS cluster"
  value       = module.eks.cluster_version
  
}

# Cluster security group: Controls network traffic to/from cluster
output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
  
}

# Security group ARN: For IAM policies or cross-account access

output "cluster_security_group_arn" {
  description = "ARN of the cluster security group"
  value       = module.eks.cluster_security_group_arn
}




# =========================================================================
# VPC OUTPUTS
# =========================================================================
# VPC ID: The unique identifier of your Virtual Private Cloud

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
  
}

# VPC CIDR: The IP address range of your VPC
output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
  
}

# Private subnet IDs: Where EKS nodes are placed
output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
  
}

# Public subnet IDs: Where load balancers are placed
output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
  
}

# NAT Gateway IDs: For troubleshooting internet connectivity
output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = module.vpc.natgw_ids
  
}

# =========================================================================
# NODE GROUP OUTPUTS
# =========================================================================
# Node group IAM role ARNs: For troubleshooting permissions

output "node_group_arns" {
  description = "ARNs of the EKS node group IAM roles"
  value       = { for k, v in module.eks.eks_managed_node_groups : k => v.iam_role_arn }

}

# Node group names: For identifying node groups in AWS console
output "node_group_names" {
  description = "Names of the EKS node groups"
  value       = keys(module.eks.eks_managed_node_groups)
  
}

# Node group IDs: Unique identifiers in AWS
output "node_group_ids" {
  description = "EKS Managed Node Group IDs"
  value       = { for k, v in module.eks.eks_managed_node_groups : k => v.node_group_id }
  
}

# Node group status: Check if nodes are healthy
output "node_group_status" {
  description = "Status of the EKS node groups"
  value       = { for k, v in module.eks.eks_managed_node_groups : k => v.node_group_status }
  
}

# =========================================================================
# IAM ROLE OUTPUTS
# =========================================================================
# EBS CSI Driver role: Allows pods to create/attach EBS volumes
output "ebs_csi_driver_role_arn" {
  description = "ARN of the EBS CSI Driver IAM role"
  value       = aws_iam_role.ebs_csi.arn
  
}

# ALB Controller role: Allows pods to create/manage load balancers
output "alb_controller_role_arn" {
  description = "ARN of the AWS Load Balancer Controller IAM role"
  value       = aws_iam_role.alb_controller.arn

}

# =========================================================================
# HELPER OUTPUTS
# =========================================================================
# Ready-to-use commands and helpful information

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
  
  # After running this command, you can use:
  # - kubectl get nodes
  # - kubectl get pods --all-namespaces
  # - kubectl apply -f deployment.yaml
}

# Comprehensive deployment info: Everything you need in one place
output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    # Basic cluster info
    cluster_name = module.eks.cluster_name
    region       = var.region
    vpc_id       = module.vpc.vpc_id
    
    # Step 1: Configure kubectl to connect to cluster
    kubectl_command = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
    
    # Step 2: Verify nodes are running and ready
    verify_nodes = "kubectl get nodes"
    
    # Step 3: Verify ALB controller is deployed and running
    verify_alb = "kubectl get deployment -n kube-system aws-load-balancer-controller"
    
    # Additional useful commands:
    # - kubectl get pods -n kube-system (see all system pods)
    # - kubectl get ingress --all-namespaces (see load balancers)
    # - kubectl logs -n kube-system deployment/aws-load-balancer-controller (ALB logs)
  }
}

