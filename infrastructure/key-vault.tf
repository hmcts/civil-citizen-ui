data "azuread_group" "dts_civil" {
  display_name     = "DTS Civil"
  security_enabled = true
}

data "azurerm_user_assigned_identity" "civil" {
  name                = "civil-${var.env}"
  resource_group_name = "managed-identities-${var.env}-rg"
}

module "key-vault" {
  source                  = "git@github.com:hmcts/cnp-module-key-vault?ref=master"
  name                    = "${var.product}-${var.component}-${var.env}"
  product                 = var.product
  env                     = var.env
  tenant_id               = var.tenant_id
  object_id               = var.jenkins_AAD_objectId
  resource_group_name     = azurerm_resource_group.rg.name
  product_group_object_id = data.azuread_group.dts_civil.object_id
  common_tags             = var.common_tags
  create_managed_identity = false
}

resource "azurerm_key_vault_access_policy" "civil_mi" {
  key_vault_id = module.key-vault.key_vault_id

  object_id = data.azurerm_user_assigned_identity.civil.principal_id
  tenant_id = data.azurerm_client_config.current.tenant_id

  key_permissions = [
    "Get",
    "List",
  ]

  certificate_permissions = [
    "Get",
    "List",
  ]

  secret_permissions = [
    "Get",
    "List",
  ]

}