
resource "azurerm_resource_group" "rg" {
  name     = var.env == "perftest" ? "${var.component}-${var.env}" : "${var.product}-${var.component}-${var.env}"
  location = var.location
  tags     = var.common_tags
}


data "azurerm_client_config" "current" {}
