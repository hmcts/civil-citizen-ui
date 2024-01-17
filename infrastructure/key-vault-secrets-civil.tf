data "azurerm_key_vault" "civil_vault" {
  name                = "civil-${var.env}"
  resource_group_name = "civil-service-${var.env}"
}

locals {
  civil_secrets = ["citizen-ui-idam-secret", "ordnance-survey-api-key", "civil-citizen-ui-token-key","launch-darkly-sdk-key","launch-darkly-sdk-key-non-prod"]
}

data "azurerm_key_vault_secret" "civil_secrets" {
  for_each = toset(local.civil_secrets)

  name         = each.value
  key_vault_id = data.azurerm_key_vault.civil_vault.id
}

resource "azurerm_key_vault_secret" "civil_secrets" {
  for_each = data.azurerm_key_vault_secret.civil_secrets

  name         = each.value.name
  value        = each.value.value
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "Key Vault ${data.azurerm_key_vault.civil_vault.name}"
  })

  depends_on = [
    module.key-vault
  ]
}
