data "azurerm_key_vault" "civil_vault" {
  name                = "civil-${var.env}"
  resource_group_name = "civil-service-${var.env}"
}


resource "azurerm_key_vault_secret" "draft_store_access_key" {
  name         = "draft-store-access-key"
  value        = module.citizen-ui-draft-store.access_key
  key_vault_id = data.azurerm_key_vault.civil_vault.id
}


