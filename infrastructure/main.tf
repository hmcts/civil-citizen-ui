provider "azurerm" {
  features {}
}

data "azurerm_key_vault" "civil_vault" {
  name                = "civil-${var.env}"
  resource_group_name = "civil-service-${var.env}"
}

data "azurerm_key_vault" "cmc_key_vault" {
  name = "cmc-${var.env}"
  resource_group_name = "cmc-${var.env}"
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name = "core-infra-${var.env}"
}

module "citizen-ui-draft-store" {
  source   = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product  = "${var.product}-${var.component}-draft-store"
  location = var.location
  env      = var.env
  subnetid = data.azurerm_subnet.core_infra_redis_subnet.id
  common_tags  = var.common_tags
}

resource "azurerm_key_vault_secret" "draft_store_access_key" {
  name         = "draft-store-access-key"
  value        = module.citizen-ui-draft-store.access_key
  key_vault_id = data.azurerm_key_vault.civil_vault.id
}

data "azurerm_key_vault_secret" "ordnance-survey-api-key" {
  name = "ordnance-survey-api-key"
  key_vault_id = data.azurerm_key_vault.civil_vault.id
}

data "azurerm_key_vault_secret" "draft_store_primary" {
  name = "citizen-draft-store-primary"
  key_vault_id = "${data.azurerm_key_vault.cmc_key_vault.id}"
}

data "azurerm_key_vault_secret" "draft_store_secondary" {
  name = "citizen-draft-store-secondary"
  key_vault_id = "${data.azurerm_key_vault.cmc_key_vault.id}"
}

