provider "azurerm" {
  features {}
}

data "azurerm_key_vault" "civil_key_vault" {
  name = "${var.product}-${var.env}"
  resource_group_name = "${var.product}-service-${var.env}"
}


