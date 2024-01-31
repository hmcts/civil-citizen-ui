data "azurerm_key_vault" "s2s_vault" {
  name                = "s2s-${var.env}"
  resource_group_name = "rpe-service-auth-provider-${var.env}"
}

locals {
  s2s_secrets = ["microservicekey-cui"]
}

data "azurerm_key_vault_secret" "s2s_secrets" {
  for_each = toset(local.s2s_secrets)

  name         = each.value
  key_vault_id = data.azurerm_key_vault.s2s_vault.id
}


resource "azurerm_key_vault_secret" "s2s_secrets" {
  for_each = data.azurerm_key_vault_secret.s2s_secrets

  name         = each.value.name
  value        = each.value.value
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "Key Vault ${data.azurerm_key_vault.s2s_vault.name}"
  })

  depends_on = [
    module.key-vault
  ]
}
