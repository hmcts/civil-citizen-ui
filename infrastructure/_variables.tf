# Short kv name added due to 24 char limitation on vault names.
locals {
  short_kv_name = "cui"
}

variable "product" {
  type        = string
  default     = "civil"
  description = "The Project Product"
}

variable "component" {
  type        = string
  default     = "citizen-ui"
  description = "The Resource"
}

variable "location" {
  type    = string
  default = "UK South"
}

variable "env" {
  type        = string
  description = "Current Environment"
}

variable "tenant_id" {
  type        = string
  description = "Target Tenant ID"
}

variable "subscription" {
  description = "Target Subscription ID"
  type        = string
}

variable "jenkins_AAD_objectId" {
  type        = string
  description = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "common_tags" {
  type        = map(string)
  description = "Default Common HMCTS Tags"
}
