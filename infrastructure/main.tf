provider "azurerm" {
  features {}
}

locals {
  vaultName = "${var.raw_product}-${var.env}"
}

data "azurerm_key_vault" "civil_key_vault" {
  name                = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}
