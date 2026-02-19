data "azurerm_key_vault_secret" "civil_ci_alert_slack_webhook" {
  name         = "civil-ci-alert-slack-group-webhook"
  key_vault_id = module.key-vault.key_vault_id
}

locals {
  draft_store_resource_group_name  = "${var.product}-${var.component}-draft-store-${var.env}"
  civil_ci_alert_slack_webhook_url = data.azurerm_key_vault_secret.civil_ci_alert_slack_webhook.value
}

# Resolve the Redis Cache resource ID from the module outputs
# `host_name` is like "<redis-name>.redis.cache.windows.net" — take the first segment as the resource name
# Then fetch the Redis resource to obtain its ARM ID for alert scopes
data "azurerm_redis_cache" "draft_store" {
  name                = split(".", module.citizen-ui-draft-store.host_name)[0]
  resource_group_name = local.draft_store_resource_group_name
}

resource "azurerm_monitor_action_group" "civil-ci-action-group" {
  for_each            = var.monitor_action_group
  name                = each.key
  resource_group_name = local.draft_store_resource_group_name
  short_name          = try(each.value.short_name, null)
  tags                = var.common_tags

  dynamic "webhook_receiver" {
    for_each = try(each.value.webhook_receiver, [])
    content {
      name        = webhook_receiver.value.name
      service_uri = local.civil_ci_alert_slack_webhook_url
    }
  }
}

resource "azurerm_monitor_metric_alert" "civil-ci-alerts" {
  for_each             = var.monitor_metric_alerts
  name                 = each.key
  resource_group_name = local.draft_store_resource_group_name
  description          = try(each.value.description, null)
  severity             = try(each.value.severity, null)
  enabled              = try(each.value.enabled, null)
  frequency            = try(each.value.frequency, null)
  window_size          = try(each.value.window_size, null)
  auto_mitigate        = try(each.value.autoMitigate, null)
  scopes               = [data.azurerm_redis_cache.draft_store.id]

  dynamic "criteria" {
    for_each = try(each.value.criteria, {})
    content {
      metric_namespace       = criteria.value.metricNamespace
      metric_name            = criteria.value.metricName
      threshold              = criteria.value.threshold
      operator               = criteria.value.operator
      aggregation            = criteria.value.aggregation
      skip_metric_validation = criteria.value.skipMetricValidation
    }
  }

  dynamic "action" {
    for_each = try(each.value.action, [])
    content {
      action_group_id = azurerm_monitor_action_group.civil-ci-action-group[action.value.action_group_name].id
    }
  }

  depends_on = [
    azurerm_monitor_action_group.civil-ci-action-group,
    module.citizen-ui-draft-store,
  ]
}
