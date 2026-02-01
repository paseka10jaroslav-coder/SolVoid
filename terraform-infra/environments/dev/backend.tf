# Backend configuration for storing Terraform state in S3
# Prerequisites:
# 1. Create S3 bucket: solvoid-terraform-state-dev (with versioning enabled)
# 2. Create DynamoDB table: solvoid-terraform-locks-dev (with LockID as primary key)
# These resources should be created manually or through a separate bootstrap process
terraform {
  backend "s3" {
    bucket         = "solvoid-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "solvoid-terraform-locks-dev"
  }
}
