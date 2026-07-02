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
}

# DTSPO-33179: The creator_access_policy exists in Azure but was missing from
# Terraform state after PR #7863 (Azure Managed Redis migration) was reverted,
# causing "resource already exists" errors on apply. This import block brings the
# existing policy back under Terraform management. Scoped to AAT only so that
# other environments (whose state is already in sync) are unaffected. Import
# blocks are a no-op once the resource is present in state, so this is safe to keep.
import {
  for_each = var.env == "aat" ? toset(["aat"]) : toset([])
  to       = module.key-vault.azurerm_key_vault_access_policy.creator_access_policy
  id       = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.rg.name}/providers/Microsoft.KeyVault/vaults/${var.product}-${local.short_kv_name}-${var.env}/objectId/${var.jenkins_AAD_objectId}"
}

data "azurerm_user_assigned_identity" "jenkins" {
  name                = "jenkins-${var.env}-mi"
  resource_group_name = "managed-identities-${var.env}-rg"
}