data "azurerm_key_vault" "cmc_vault" {
  name                = "cmc-${var.env}"
  resource_group_name = "cmc-${var.env}"
}

locals {
  cmc_secrets = ["cmc-s2s-secret", "citizen-draft-store-primary", "citizen-draft-store-secondary"]
}

data "azurerm_key_vault_secret" "cmc_secrets" {
  for_each = toset(local.cmc_secrets)

  name         = each.value
  key_vault_id = data.azurerm_key_vault.cmc_vault.id
}

resource "azurerm_key_vault_secret" "cmc_secrets" {
  for_each = data.azurerm_key_vault_secret.cmc_secrets

  name         = each.value.name
  value        = each.value.value
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "Key Vault ${data.azurerm_key_vault.cmc_vault.name}"
  })

  depends_on = [
    module.key-vault
  ]
}