## Introduction

These are the Terraform resources specifically for the Civil Citizen UI Application.

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_azurerm"></a> [azurerm](#requirement\_azurerm) | ~> 2.95 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_azuread"></a> [azuread](#provider\_azuread) | 2.33.0 |
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | 2.99.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_citizen-ui-draft-store"></a> [citizen-ui-draft-store](#module\_citizen-ui-draft-store) | git@github.com:hmcts/cnp-module-redis | master |
| <a name="module_key-vault"></a> [key-vault](#module\_key-vault) | git@github.com:hmcts/cnp-module-key-vault | master |
| <a name="module_application-insights"></a> [application-insights](#module\_application-insights) | git@github.com:hmcts/terraform-module-application-insights | main |

## Resources

| Name | Type |
|------|------|
| [azurerm_key_vault_secret.app_insights_instrumentation_key](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_secret) | resource |
| [azurerm_key_vault_secret.draft_store_access_key](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_secret) | resource |
| [azurerm_resource_group.rg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group) | resource |
| [azuread_group.dts_civil](https://registry.terraform.io/providers/hashicorp/azuread/latest/docs/data-sources/group) | data source |
| [azurerm_key_vault.civil_vault](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/key_vault) | data source |
| [azurerm_subnet.core_infra_redis_subnet](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/subnet) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_common_tags"></a> [common\_tags](#input\_common\_tags) | Default Common HMCTs Tags | `map(string)` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The Resource | `string` | `"citizen-ui"` | no |
| <a name="input_env"></a> [env](#input\_env) | Current Environment | `string` | n/a | yes |
| <a name="input_jenkins_AAD_objectId"></a> [jenkins\_AAD\_objectId](#input\_jenkins\_AAD\_objectId) | (Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. | `string` | n/a | yes |
| <a name="input_location"></a> [location](#input\_location) | n/a | `string` | `"UK South"` | no |
| <a name="input_product"></a> [product](#input\_product) | The Project Product | `string` | `"civil"` | no |
| <a name="input_subscription"></a> [subscription](#input\_subscription) | Target Subscription ID | `string` | n/a | yes |
| <a name="input_tenant_id"></a> [tenant\_id](#input\_tenant\_id) | Target Tenant ID | `string` | n/a | yes |

## Outputs

No outputs.