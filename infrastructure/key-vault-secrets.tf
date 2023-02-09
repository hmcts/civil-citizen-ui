resource "azurerm_key_vault_secret" "app_insights_instrumentation_key" {
  name         = "appinsights-instrumentation-key"
  value        = azurerm_application_insights.web.instrumentation_key
  key_vault_id = module.key-vault.key_vault_id

  content_type = "secret"
  tags = merge(var.common_tags, {
    "source" : "appinsights ${azurerm_application_insights.web.name}"
  })

  depends_on = [
    module.key-vault
  ]
}