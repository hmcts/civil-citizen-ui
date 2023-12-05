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

variable "family" {
  default     = "C"
  description = "The SKU family/pricing group to use. Valid values are `C` (for Basic/Standard SKU family) and `P` (for Premium). Use P for higher availability, but beware it costs a lot more."
}

variable "sku_name" {
  default     = "Basic"
  description = "The SKU of Redis to use. Possible values are `Basic`, `Standard` and `Premium`."
}

variable "capacity" {
  default     = "1"
  description = "The size of the Redis cache to deploy. Valid values are 1, 2, 3, 4, 5"
}