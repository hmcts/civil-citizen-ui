provider "azurerm" {
  features {}
}


locals {
  vaultNameCivil = "civil-${var.env}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = var.location

  tags = var.common_tags
}

data "azurerm_key_vault" "civil_key_vault" {
  name = "${local.vaultNameCivil}"
  resource_group_name = azurerm_resource_group.rg.name
}


