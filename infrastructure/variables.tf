variable "product" {
  default = "civil"
}
variable "component" {
  default = "citizen-ui"
}

variable "location" {
  default = "UK South"
}

variable "env" {}

variable "ilbIp" { }

variable "subscription" {}

variable "jenkins_AAD_objectId" {
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "common_tags" {
  type = map(string)
}
