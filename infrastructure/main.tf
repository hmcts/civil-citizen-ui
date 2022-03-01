provider "azurerm" {
  features {}
}

data "azurerm_key_vault" "civil_vault" {
  name                = "civil-${var.env}"
  resource_group_name = "civil-service-${var.env}"
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name = "core-infra-${var.env}"
}

module "civil-citizen-ui-draft-store" {
  source   = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product  = var.product
  location = var.location
  env      = var.env
  subnetid = data.azurerm_subnet.core_infra_redis_subnet.id
  common_tags  = var.common_tags
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "redis-access-key"
  value        = module.civil-citizen-ui-draft-store.access_key
  key_vault_id = data.azurerm_key_vault.civil_vault.id
}
