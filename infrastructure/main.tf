provider "azurerm" {
  features {}
}

locals {
  vaultName = "${var.product}-shared-${var.env}"
}

data "azurerm_key_vault" "key_vault" {
  name = local.vaultName
  resource_group_name = local.vaultName
}
