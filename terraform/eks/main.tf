# =========================================================================
# main.tf - EKS Cluster Infrastructure with ALB Controller
# =========================================================================
# This file creates a complete EKS cluster.
# =========================================================================



# -------------------------------------------------------------------------
# VPC Module - Network Infrastructure
# -------------------------------------------------------------------------
# Creates a VPC with:
# - Public subnets: For load balancers and NAT gateways
# - Private subnets: For EKS worker nodes (more secure)
# - NAT Gateway: Allows private subnet resources to access internet
# - Internet Gateway: Allows public subnet resources to access internet
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "eks-vpc"
  cidr = var.vpc_cidr               # VPC CIDR block (e.g.,                                       

  azs = var.availability_zones                              # Availability Zones to use
  
  public_subnets = var.public_subnet_cidrs               
  
  private_subnets = var.private_subnet_cidrs                        

  enable_nat_gateway = true                                       
  
  single_nat_gateway = true                                       # Use single NAT Gateway to save costs (all private subnets share it)

  # Tags for public subnets - Required by AWS Load Balancer Controller
  # The ALB controller uses these tags to discover where to create load balancers
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"  # Tells ALB controller: use these for public ALBs
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"  # Links subnet to cluster
  }

  # Tags for private subnets - Required by AWS Load Balancer Controller
  # For internal load balancers (within VPC only)
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"  # For internal ALBs
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
    Project     = var.project_name    
  } 
}

# -------------------------------------------------------------------------
# EKS Cluster Module
# -------------------------------------------------------------------------
# Creates the EKS control plane and managed node group
# Control plane: Kubernetes API server, scheduler, controller manager (AWS managed)
# Node group: EC2 instances that run your containerized applications.

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.8.4"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version    # Kubernetes version
  
  enable_irsa = true             # Enable IRSA: Allows Kubernetes service accounts to assume IAM roles
                                 # This is more secure than giving all pods the same node-level permissions

  cluster_endpoint_public_access = true       # Allow public access to cluster API endpoint

  
  subnet_ids = module.vpc.private_subnets      # Place worker nodes in private subnets for better security.
  vpc_id     = module.vpc.vpc_id

  # Managed Node Groups: AWS manages the EC2 instances for you
  # Handles updates, patching, and scaling automatically
  eks_managed_node_groups = {
    ecommerce-eks-nodes = {
      desired_size   = var.node_desired_size  # Number of nodes to start with
      max_size       = var.node_max_size  # Maximum nodes for auto-scaling
      min_size       = var.node_min_size  # Minimum nodes for auto-scaling
      instance_types = var.node_instance_types  # EC2 instance type (2 vCPU, 4GB RAM)

      tags = {
        Name = "${var.project_name}-${var.cluster_name}-nodes"
      }
    }
  }

  # Cluster Add-ons: Essential Kubernetes components
  cluster_addons = {
    # EBS CSI Driver: Enables persistent storage using AWS EBS volumes
    aws-ebs-csi-driver = {
      resolve_conflicts        = "OVERWRITE"               # Auto-fix conflicts during updates
      service_account_role_arn = aws_iam_role.ebs_csi.arn  # IRSA role for EBS
    }
    
    # Kube-proxy: Handles network routing between pods
    kube-proxy = {
      resolve_conflicts = "OVERWRITE"
    }
    
    # VPC CNI: AWS networking plugin for pod IP addresses
    # Assigns private IPs from your VPC to each pod
    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
    }
    
    # CoreDNS: DNS server for Kubernetes cluster
    coredns = {
      resolve_conflicts = "OVERWRITE"    # Handle version conflicts automatically. 
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# -------------------------------------------------------------------------
# Data Sources - Fetch Information About Created Resources
# -------------------------------------------------------------------------
# These data sources retrieve information about the EKS cluster after it's created 

data "aws_eks_cluster" "eks_admin" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]               # Wait for cluster to be created first
}

# Fetch authentication token to access the cluster

data "aws_eks_cluster_auth" "eks_admin" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]                # Wait for cluster to be created first  
}

# -------------------------------------------------------------------------
# EKS Access Entry - Grant Admin User Access to Cluster
# -------------------------------------------------------------------------
# EKS Access Entries: New way to manage cluster access (replaces aws-auth ConfigMap)
# More secure and easier to manage than the old ConfigMap method

# Create access entry for your admin IAM user
resource "aws_eks_access_entry" "admin" {
  cluster_name  = module.eks.cluster_name
  principal_arn = var.admin_user_arn  # Your IAM user ARN
  type          = "STANDARD"  # Standard user (not EC2 node)

  depends_on = [module.eks]
}
# Associate admin policy with the access entry
# This gives full cluster admin permissions (create/delete any resource)
resource "aws_eks_access_policy_association" "admin_access" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_eks_access_entry.admin.principal_arn

  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"            # Amazon's pre-defined admin policy

  access_scope {
    type = "cluster"  # Admin across entire cluster (not just specific namespaces)
  }

  depends_on = [aws_eks_access_entry.admin]
}

resource "aws_eks_access_entry" "admin_github_action" {
  cluster_name  = module.eks.cluster_name
  principal_arn = var.admin_user_arn_github_actions  # Your IAM user ARN
  type          = "STANDARD"  # Standard user (not EC2 node)

  depends_on = [module.eks]
}

resource "aws_eks_access_policy_association" "admin_access_github" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_eks_access_entry.admin_github_action.principal_arn

  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"            # Amazon's pre-defined admin policy

  access_scope {
    type = "cluster"  # Admin across entire cluster (not just specific namespaces)
  }

  depends_on = [aws_eks_access_entry.admin]
  
}



# =========================================================================
# IAM ROLES FOR SERVICE ACCOUNTS (IRSA)
# =========================================================================
# IRSA allows Kubernetes service accounts to assume AWS IAM roles
# More secure than giving all pods node-level IAM permissions


# -------------------------------------------------------------------------
# IAM Role for EBS CSI Driver (IRSA)
# -------------------------------------------------------------------------
# The EBS CSI Driver needs AWS permissions to:
# - Create/attach/delete EBS volumes

data "aws_iam_policy_document" "ebs_csi_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]  # Use OIDC for authentication
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]  # EKS OIDC provider
    }

    # Only allow the specific service account to assume this role
    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }

    # Ensure the audience is AWS STS
    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

# Create the IAM role
resource "aws_iam_role" "ebs_csi" {
  name               = "eks-ebs-csi-driver-${local.cluster_name}"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json

  tags = {
    Name        = "${var.project_name}-ebs-csi-driver"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Attach AWS managed policy that grants EBS permissions
resource "aws_iam_role_policy_attachment" "ebs_csi" {
  role       = aws_iam_role.ebs_csi.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# -------------------------------------------------------------------------
# IAM Role for AWS Load Balancer Controller (IRSA)
# -------------------------------------------------------------------------
# The ALB Controller needs AWS permissions to:
# - Create/delete Application Load Balancers (ALBs)
# - Manage target groups (route traffic to pods)
# - Configure security groups and listeners

data "aws_iam_policy_document" "alb_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    # Only the ALB controller service account can assume this role
    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

# Create the IAM role
resource "aws_iam_role" "alb_controller" {
  name               = "${var.project_name}-${var.cluster_name}-alb-controller"
  assume_role_policy = data.aws_iam_policy_document.alb_assume_role.json

  tags = {
    Name        = "${var.project_name}-${var.cluster_name}-alb-controller"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Fetch the latest ALB Controller IAM policy from AWS GitHub
# This policy is maintained by AWS and updated regularly
data "http" "alb_iam_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json"
}

# Create IAM policy from the fetched JSON
resource "aws_iam_policy" "alb_controller" {
  name        = "AWSLoadBalancerControllerIAMPolicy-${var.cluster_name}"
  description = "IAM policy for AWS Load Balancer Controller"
  policy      = data.http.alb_iam_policy.response_body

  tags = {
    Name        = "${var.project_name}-${var.cluster_name}-alb-controller-policy"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "alb_controller" {
  role       = aws_iam_role.alb_controller.name
  policy_arn = aws_iam_policy.alb_controller.arn
}

# -------------------------------------------------------------------------
# Kubernetes Service Account for ALB Controller
# -------------------------------------------------------------------------
# This service account will be used by the ALB controller pods
# It's annotated with the IAM role ARN to enable IRSA

resource "kubernetes_service_account" "alb_controller" {
  metadata {
    name      = "${var.project_name}-${var.cluster_name}-aws-load-balancer-controller"
    namespace = "kube-system"
    
    # This annotation links the service account to the IAM role
    # When a pod uses this service account, it can assume the IAM role
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.alb_controller.arn
    }
  }

  # Wait for IAM role and admin access to be ready
  depends_on = [
    aws_iam_role_policy_attachment.alb_controller,
    aws_eks_access_policy_association.admin_access
  ]
}

# -------------------------------------------------------------------------
# Helm Release - Deploy AWS Load Balancer Controller
# -------------------------------------------------------------------------
# Helm is a package manager for Kubernetes (like apt/yum for Linux)
# This deploys the ALB controller application into your cluster
# The controller watches for Ingress resources and creates ALBs automatically

resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"  # AWS official Helm repository
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"  # Deploy to system namespace

  # Chart configuration: Tell the controller about our cluster
  
  
   set {                 # Set the cluster name so controller knows which cluster to manage
          name = "clusterName"           
          value = module.eks.cluster_name
    }
          
   set {                 # Don't create a service account (we already created it above)
          name = "serviceAccount.create"  
          value = "false"
     }   
           
   set {                 # Use our existing service account (with IRSA annotation)
    name = "serviceAccount.name"    
    value = "aws-load-balancer-controller"
     }
    
   set {                  # Set AWS region for API calls
        name = "region"                 
        value = var.region 
        }         
              
   set {                  # VPC ID where ALBs will be created
    name = "vpcId"                 
    value = module.vpc.vpc_id 
   }          
                          
  


  # Wait for service account and IAM role to be ready before deploying
  depends_on = [
    kubernetes_service_account.alb_controller,
    aws_iam_role_policy_attachment.alb_controller
  ]
}

