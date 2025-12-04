
# -------------------------
# Outputs
# -------------------------
output "cluster_endpoint" {
  description = "EKS Cluster Endpoint"
  value       = module.eks.cluster_endpoint
}
output "cluster_name" {
  description = "EKS Cluster Name"
  value       = module.eks.cluster_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private Subnets"
  value       = module.vpc.private_subnets
} 
output "public_subnets" {
  description = "Public Subnets"
  value       = module.vpc.public_subnets
}


output "node_group_arns" {
  description = "EKS Node Group ARNs"
  value = { for k, v in module.eks.eks_managed_node_groups : k => v.iam_role_arn }
}

output "node_group_names" {
  description = "EKS Node Group Names"
  value = keys(module.eks.eks_managed_node_groups)
}




output "cluster_security_group_id" {
  description = "EKS Cluster Security Group ID"
  value       = module.eks.cluster_security_group_id
}
output "cluster_security_group_arn" {
  description = "EKS Cluster Security Group ARN"
  value       = module.eks.cluster_security_group_arn
}


output "eks_nodegroup_role_arn" {
  value = module.eks.eks_managed_node_groups["ecommerce-eks-nodes"].iam_role_arn
}



