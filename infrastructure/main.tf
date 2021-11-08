provider "azurerm" {
 features {}
}

locals {
  vaultName = "${var.product}-${var.env}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = var.location
  tags = var.common_tags
}

# this key vault is created in every environment, but preview, being short-lived,
# will use the aat one instead
module "key-vault" {
source              = "git@github.com:hmcts/cnp-module-key-vault?ref=master"
  product             = var.product
  env                 = var.env
  object_id           = var.jenkins_AAD_objectId
  resource_group_name = azurerm_resource_group.rg.name
  product_group_name  = "DTS Civil" # e.g. MI Data Platform, or dcd_cmc
  common_tags         = var.common_tags
}

data "azurerm_key_vault" "civil_key_vault" {
  name = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}

data "azurerm_key_vault_secret" "cookie_encryption_key" {
  name = "citizen-cookie-encryption-key"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "s2s_secret" {
  name = "civil-s2s-secret"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "draft_store_primary" {
  name = "citizen-draft-store-primary"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "draft_store_secondary" {
  name = "citizen-draft-store-secondary"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "os_postcode_lookup_api_key" {
  name = "os-postcode-lookup-api-key"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "oauth_client_secret" {
  name = "citizen-oauth-client-secret"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "staff_email" {
  name = "staff-email"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "launch_darkly_sdk_key" {
  name = "launchDarkly-sdk-key"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "civil_webchat_id" {
  name = "civil-webchat-id"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "cmc_webchat_tenant" {
  name = "civil-webchat-tenant"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "civil_webchat_button_no_agents" {
  name = "civil-webchat-button-no-agents"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}
data "azurerm_key_vault_secret" "civil_webchat_button_busy" {
  name = "civil-webchat-button-busy"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "civil_webchat_button_service_closed" {
  name = "civil-webchat-button-service-closed"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "pcq_token_key" {
  name = "pcq-token-key"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}

data "azurerm_key_vault_secret" "app_insights_instrumental_key" {
  name = "AppInsightsInstrumentationKey"
  key_vault_id = "${data.azurerm_key_vault.civil_key_vault.id}"
}
