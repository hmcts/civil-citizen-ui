// Infrastructural variables
variable "product" {}

variable "component" {}


variable "location" {
  default = "UK South"
}

variable "env" {}

variable "subscription" {}

variable "jenkins_AAD_objectId" {
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "tenant_id" {
  description = "(Required) The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. This is usually sourced from environemnt variables and not normally required to be specified."
}

variable "common_tags" {
  type = map(string)
}
