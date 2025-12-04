# -------------------------
# VPC
# -------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "eks-vpc"
  cidr = "10.10.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.10.1.0/24", "10.10.2.0/24"]
  private_subnets = ["10.10.3.0/24", "10.10.4.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Name = "ecommerce-eks-vpc"
  }
}

# -------------------------
# EKS Cluster + Nodes
# -------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.8.4"

  cluster_name    = "ecommerce-eks-cluster"
  cluster_version = "1.30"
  enable_irsa = true

  cluster_endpoint_public_access = true

  subnet_ids = module.vpc.private_subnets
  vpc_id     = module.vpc.vpc_id

  eks_managed_node_groups = {
    ecommerce-eks-nodes = {
      desired_size = 2
      max_size     = 2
      min_size     = 2
      instance_types = ["t3.medium"]
      subnet_ids     = module.vpc.private_subnets

      node_groups_tags = {
        Name = "ecommerce-eks-nodes"  
      }
    }
  }
  cluster_addons = {
  "aws-ebs-csi-driver" = {
    resolve_conflicts = "OVERWRITE"
  }
}

  tags = {
    Environment = "Dev"
    Project     = "ECOMMERCE-EKS"
  }
}


# -------------------------
# Data Resources (Single Instance)
# -------------------------
// Fetch EKS Cluster Info for Admin Access and Provider Configuration, depends on EKS module.
data "aws_eks_cluster" "eks_admin" {
  name = module.eks.cluster_name
  depends_on = [module.eks]
}

data "aws_eks_cluster_auth" "eks_admin" {
  name = module.eks.cluster_name
  depends_on = [module.eks]
}

# -------------------------
# EKS Access Entry for Node Group Role
# -------------------------
// Grant node group IAM role access to the EKS cluster and associate the standard policy, depends on node groups creation.
resource "aws_eks_access_entry" "nodegroup" {
  cluster_name  = module.eks.cluster_name
  principal_arn = module.eks.eks_managed_node_groups["ecommerce-eks-nodes"].iam_role_arn
  type          = "EC2"

  lifecycle {
    # Prevent Terraform from recreating if already exists
    ignore_changes = [principal_arn, cluster_name]
  }


}

resource "aws_iam_role_policy_attachment" "nodegroup_ebs_csi" {
  role       = module.eks.eks_managed_node_groups["ecommerce-eks-nodes"].iam_role_name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"


}



# -------------------------
# Admin User Access Entry
# -------------------------
// Grant admin user access to the EKS cluster and associate the admin policy, depends on EKS module.
resource "aws_eks_access_entry" "admin" {
  cluster_name  = data.aws_eks_cluster.eks_admin.name
  principal_arn = "arn:aws:iam::737427925739:user/Admin-terraform"
  type          = "STANDARD"
  


  lifecycle {
    ignore_changes = [
      principal_arn,
      cluster_name
    ]
    
  }
}

resource "aws_eks_access_policy_association" "admin_access" {
  cluster_name  = data.aws_eks_cluster.eks_admin.name
  principal_arn = aws_eks_access_entry.admin.principal_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"



  access_scope {
    type = "cluster"
  }
 
}

# -------------------------
# -------------------------
# AWS Load Balancer Controller IAM Policy
# -------------------------
// Create IAM Role for the AWS Load Balancer Controller and attach the required policy, depends on OIDC provider from EKS module.
resource "aws_iam_role" "alb_controller" {
  name               = "eks-alb-controller"
  assume_role_policy = data.aws_iam_policy_document.alb_sa.json
  
  lifecycle {
    # Prevent recreation if already exists
    ignore_changes = [assume_role_policy]
  } 
}
resource "aws_iam_policy" "alb_controller" {
  name   = "AWSLoadBalancerControllerIAMPolicy-${module.eks.cluster_name}"
  policy = data.http.alb_iam_policy.response_body
}
data "http" "alb_iam_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json"
}
resource "aws_iam_role_policy_attachment" "alb_controller_attach" {
  role       = aws_iam_role.alb_controller.name
  policy_arn = aws_iam_policy.alb_controller.arn
}


# -------------------------
# IAM Role for ALB Controller Service Account
# -------------------------
// Create IAM Role with OIDC Trust Relationship for the Service Account, depends on OIDC provider from EKS module.
data "aws_iam_policy_document" "alb_sa" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn] 
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub"

      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

# -------------------------
# Kubernetes ServiceAccount for the IAM Role
# -------------------------
// create a Kubernetes Service Account linked to the IAM Role, depends on IAM Role creation.
resource "kubernetes_service_account" "alb_controller" {
  metadata {
    name      = "aws-load-balancer-controller"
    namespace = "kube-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.alb_controller.arn
    }
  }
  depends_on = [aws_iam_role_policy_attachment.alb_controller_attach, aws_eks_access_policy_association.admin_access]

}

# -------------------------
# Helm Release for ALB Controller
# -------------------------
// helm chart to deploy AWS Load Balancer Controller, depends on Service Account and IAM Role Policy Attachment.
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

set = [
  { name = "clusterName"            , value = module.eks.cluster_name },
  { name = "serviceAccount.create"  , value = "false"                 },
  { name = "serviceAccount.name"    , value = "aws-load-balancer-controller" },
  { name = "vpcId", value = module.vpc.vpc_id },
  { name  = "subnetIDs" ,value = "{${join(",", module.vpc.public_subnets)}}" }
]

  depends_on = [
    kubernetes_service_account.alb_controller,
    aws_iam_role_policy_attachment.alb_controller_attach
  ]
}
