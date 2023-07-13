resource "azurerm_application_insights" "web" {
  name                = var.env == "perftest" ? "${var.component}-${var.env}" : "${var.product}-${var.component}-${var.env}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  tags                = var.common_tags
}

