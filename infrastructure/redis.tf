data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "citizen-ui-draft-store" {
  source                          = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product                         = "${var.product}-${var.component}-draft-store"
  location                        = var.location
  env                             = var.env
  subnetid                        = data.azurerm_subnet.core_infra_redis_subnet.id
  common_tags                     = var.common_tags
  redis_version                   = 6
  private_endpoint_enabled        = true
  business_area                   = "cft"
  public_network_access_enabled   = false
  sku_name                        = var.sku_name
  family                          = var.family
  capacity                        = var.capacity
  maxmemory_reserved              = var.maxmemory_reserved
  maxfragmentationmemory_reserved = var.maxfragmentationmemory_reserved
  maxmemory_delta                 = var.maxmemory_delta
}

# Azure Managed Redis (DTSCCI-5712)

module "managed_redis" {
  source = "git@github.com:hmcts/terraform-module-azure-managed-redis?ref=main"

  product     = var.product
  component   = var.component
  env         = var.env
  location    = var.location
  common_tags = var.common_tags

  sku_name          = var.managed_redis_sku
  clustering_policy = "EnterpriseCluster"

  public_network_access   = "Disabled"
  create_private_endpoint = true
  subnet_id               = data.azurerm_subnet.core_infra_redis_subnet.id
  private_dns_zone_ids = [
    "/subscriptions/${var.private_dns_subscription_id}/resourceGroups/core-infra-intsvc-rg/providers/Microsoft.Network/privateDnsZones/privatelink.redis.azure.net"
  ]

  access_keys_authentication_enabled = true
}
