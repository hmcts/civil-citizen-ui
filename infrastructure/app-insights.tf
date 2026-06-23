module "application_insights" {
  source = "git@github.com:hmcts/terraform-module-application-insights?ref=4.x"

  env      = var.env
  product  = var.product
  location = azurerm_resource_group.rg.location
  name     = "${var.product}-${var.component}"

  resource_group_name = azurerm_resource_group.rg.name

  common_tags = var.common_tags

  # Capture full telemetry on perftest so load-test failures (failed requests, 5xx, exceptions)
  # are not dropped by the module's default non-prod ingestion sampling of 1%, which blocks
  # diagnosis of performance runs. Other environments keep the module defaults (prod = 100%,
  # other non-prod = 1%). See DTSCCI-5714.
  sampling_percentage = var.env == "perftest" ? 100 : null
}

moved {
  from = azurerm_application_insights.web
  to   = module.application_insights.azurerm_application_insights.this
}
