data "azuread_group" "dts_civil" {
  display_name     = "DTS Civil"
  security_enabled = true
}

data "azurerm_user_assigned_identity" "civil" {
  name                = "civil-${var.env}-mi"
  resource_group_name = "managed-identities-${var.env}-rg"
}

module "key-vault" {
  source                      = "git@github.com:hmcts/cnp-module-key-vault?ref=DTSPO-31965/remove-jenkins-ptl-access"
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

data "azurerm_user_assigned_identity" "jenkins" {
  name                = "jenkins-${var.env}-mi"
  resource_group_name = "managed-identities-${var.env}-rg"
}

import {
  to = module.key-vault.azurerm_key_vault_access_policy.jenkins[0]
  id = "/subscriptions/1c4f0704-a29e-403d-b719-b90c34ef14c9/resourceGroups/civil-citizen-ui-aat/providers/Microsoft.KeyVault/vaults/civil-cui-aat/objectId/14b22215-46e6-48a9-8681-e8cefe66236a"
}
