module "application_insights" {
  source = "git@github.com:hmcts/terraform-module-application-insights?ref=main"

  env      = var.env
  product  = var.product
  location = azurerm_resource_group.rg.location
  name     = "${var.product}-${var.component}"

  resource_group_name = azurerm_resource_group.rg.name

  common_tags = var.common_tags
}

moved {
  from = azurerm_application_insights.web
  to   = module.application_insights.azurerm_application_insights.this
}
