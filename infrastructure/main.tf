provider "azurerm" {
  features {}
}
locals {
  civilSharedVaultName = "${var.product}-shared-${var.env}"
}

data "azurerm_key_vault" "civil_key_vault" {
  name = "${local.civilSharedVaultName}"
  resource_group_name = "${local.civilSharedVaultName}"
}


