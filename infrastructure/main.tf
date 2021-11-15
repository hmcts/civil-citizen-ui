provider "azurerm" {
  features {}
}
locals {
  cmcVaultName = "cmc"
}

data "azurerm_key_vault" "civil_key_vault" {
  name = "${local.cmcVaultName}-${var.env}"
  resource_group_name = "${local.cmcVaultName}-${var.env}"
}


