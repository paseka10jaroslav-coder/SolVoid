# Terraform Infrastructure

This directory contains the Terraform infrastructure code for the SolVoid project.

## Directory Structure

```
terraform-infra/
├── .github/
│   ├── workflows/
│   │   └── terraform.yml          # CI/CD workflow for Terraform
│   ├── CODEOWNERS                 # Code ownership configuration
│   └── pull_request_template.md   # PR template for infrastructure changes
├── environments/
│   ├── dev/                       # Development environment
│   │   ├── main.tf               # Main Terraform configuration
│   │   ├── variables.tf          # Variable definitions
│   │   ├── outputs.tf            # Output definitions
│   │   └── backend.tf            # Backend configuration
│   ├── staging/                   # Staging environment (to be configured)
│   └── prod/                      # Production environment (to be configured)
├── modules/
│   └── vpc/                       # VPC module
│       ├── main.tf               # VPC resources
│       ├── variables.tf          # VPC variables
│       └── outputs.tf            # VPC outputs
├── .gitignore                     # Terraform-specific gitignore
└── README.md                      # This file
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.5.0
- AWS CLI configured with appropriate credentials
- S3 bucket for Terraform state (configured in backend.tf)
- DynamoDB table for state locking

### Backend Setup

Before running `terraform init`, you need to create the backend resources manually:

1. **Create S3 Bucket for State Storage:**
   ```bash
   aws s3api create-bucket --bucket solvoid-terraform-state-dev --region us-east-1
   aws s3api put-bucket-versioning --bucket solvoid-terraform-state-dev --versioning-configuration Status=Enabled
   aws s3api put-bucket-encryption --bucket solvoid-terraform-state-dev --server-side-encryption-configuration '{
     "Rules": [{
       "ApplyServerSideEncryptionByDefault": {
         "SSEAlgorithm": "AES256"
       }
     }]
   }'
   ```

2. **Create DynamoDB Table for State Locking:**
   ```bash
   aws dynamodb create-table \
     --table-name solvoid-terraform-locks-dev \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
     --region us-east-1
   ```

## Getting Started

### 1. Initialize Terraform

Navigate to the desired environment directory and initialize Terraform:

```bash
cd terraform-infra/environments/dev
terraform init
```

### 2. Review the Plan

Review the planned changes before applying:

```bash
terraform plan
```

### 3. Apply Changes

Apply the Terraform configuration:

```bash
terraform apply
```

## Environments

### Development (dev)
- **Region**: us-east-1
- **VPC CIDR**: 10.0.0.0/16
- **Purpose**: Development and testing

### Staging
- To be configured
- Similar structure to dev environment

### Production (prod)
- To be configured
- Enhanced security and compliance measures

## Modules

### VPC Module
Creates a VPC with:
- Public and private subnets across multiple availability zones
- Internet Gateway for public internet access
- NAT Gateways for private subnet internet access
- Route tables and associations

## CI/CD

The GitHub Actions workflow (`.github/workflows/terraform.yml`) automatically:
- Validates Terraform formatting
- Runs `terraform init`
- Runs `terraform validate`
- Runs `terraform plan` on pull requests
- Runs `terraform apply` on merges to main branch

### GitHub Actions Setup

Before the workflow can run, you need to configure the following secrets in your GitHub repository:

1. **AWS_ACCESS_KEY_ID**: AWS access key with permissions to manage infrastructure
2. **AWS_SECRET_ACCESS_KEY**: AWS secret access key

To add these secrets:
1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

Alternatively, you can configure OIDC authentication with AWS IAM for a more secure, keyless approach.

## Best Practices

1. **State Management**: Always use remote state (S3 backend) with state locking (DynamoDB)
2. **Code Review**: All infrastructure changes must go through pull request review
3. **Testing**: Test changes in dev environment before applying to staging/prod
4. **Documentation**: Update documentation when adding new modules or resources
5. **Security**: Never commit sensitive data or credentials to version control
6. **Formatting**: Run `terraform fmt` before committing changes

## Security Considerations

- All resources are tagged with environment and managed-by metadata
- State files are encrypted at rest in S3
- State locking prevents concurrent modifications
- CODEOWNERS ensures proper review of infrastructure changes

## Contributing

1. Create a new branch for your changes
2. Make changes in the appropriate environment or module
3. Run `terraform fmt` to format your code
4. Run `terraform validate` to validate your configuration
5. Create a pull request with a detailed description
6. Ensure CI/CD checks pass
7. Request review from code owners

## Support

For questions or issues, please open an issue in the repository or contact the infrastructure team.
