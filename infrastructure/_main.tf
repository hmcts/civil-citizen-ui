
resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = var.location
  tags     = var.common_tags
}


data "azurerm_client_config" "current" {}

module "civil-citizen-ui-cache-draft-store" {
  source                          = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product                         = var.product
  location                        = var.location
  env                             = var.env
  common_tags                     = var.common_tags
  redis_version                   = "6"
  business_area                   = "cft"
  private_endpoint_enabled        = true
  public_network_access_enabled   = false
}
