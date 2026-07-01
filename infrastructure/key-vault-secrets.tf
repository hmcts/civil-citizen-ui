resource "azurerm_key_vault_secret" "app_insights_instrumentation_key" {
  name         = "appinsights-instrumentation-key"
  value        = module.application_insights.instrumentation_key
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "appinsights ${module.application_insights.name}"
  })

  depends_on = [
    module.key-vault
  ]
}
resource "azurerm_key_vault_secret" "app_insights_connection_string" {
  name         = "appinsights-connection-string"
  value        = module.application_insights.connection_string
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "appinsights ${module.application_insights.name}"
  })

  depends_on = [
    module.key-vault
  ]
}

resource "azurerm_key_vault_secret" "redis_draft_store_access_key" {
  name         = "draft-store-access-key"
  value        = module.citizen-ui-draft-store.access_key
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "redis ${module.citizen-ui-draft-store.host_name}"
  })
}
