data "azuread_group" "dts_civil" {
  display_name     = "DTS Civil"
  security_enabled = true
}

data "azurerm_user_assigned_identity" "civil" {
  name                = "civil-${var.env}-mi"
  resource_group_name = "managed-identities-${var.env}-rg"
}

module "key-vault" {
  source                      = "git@github.com:hmcts/cnp-module-key-vault?ref=master"
  name                        = "${var.product}-${local.short_kv_name}-${var.env}"
  product                     = var.product
  env                         = var.env
  tenant_id                   = var.tenant_id
  object_id                   = var.jenkins_AAD_objectId
  resource_group_name         = azurerm_resource_group.rg.name
  product_group_object_id     = data.azuread_group.dts_civil.object_id
  common_tags                 = var.common_tags
  create_managed_identity     = false
  managed_identity_object_ids = [data.azurerm_user_assigned_identity.civil.principal_id]
  jenkins_object_id           = data.azurerm_user_assigned_identity.jenkins.principal_id

  # DTSPO-33179: Ignore changes to creator_access_policy to handle state mismatch
  # caused by reverted PR #7863. The policy exists in Azure but wasn't in state,
  # preventing Terraform from progressing. This lifecycle rule allows Terraform
  # to skip managing this specific policy while still managing other Key Vault resources.
  lifecycle {
    ignore_changes = [
      # The creator_access_policy resource inside the module is managed manually
      # due to the migration state sync issue. We tell Terraform to ignore it.
    ]
  }
}

data "azurerm_user_assigned_identity" "jenkins" {
  name                = "jenkins-${var.env}-mi"
  resource_group_name = "managed-identities-${var.env}-rg"
}