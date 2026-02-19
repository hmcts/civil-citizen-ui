data "azurerm_key_vault_secret" "civil_ci_alert_slack_webhook" {
  name         = "civil-ci-alert-slack-group-webhook"
  key_vault_id = module.key-vault.key_vault_id
}

locals {
  draft_store_resource_group_name = "rs-${var.product}-${var.component}-draft-store-${var.env}"
  civil_ci_alert_slack_webhook_url = data.azurerm_key_vault_secret.civil_ci_alert_slack_webhook.value
}

resource "azurerm_monitor_action_group" "this" {
  for_each            = var.monitor_action_group
  name                = each.key
  resource_group_name = local.draft_store_resource_group_name
  short_name          = each.value.short_name
  tags                = var.common_tags

  dynamic "webhook_receiver" {
    for_each = each.value.webhook_receiver
    content {
      name        = webhook_receiver.value.name
      service_uri = local.civil_ci_alert_slack_webhook_url
    }
  }
}

resource "azurerm_monitor_metric_alert" "this" {
  for_each             = var.monitor_metric_alerts
  name                 = each.key
  description          = each.value.description
  severity             = each.value.severity
  enabled              = each.value.enabled
  evaluation_frequency = each.value.evaluationFrequency
  window_duration      = each.value.window_size
  auto_mitigate        = each.value.autoMitigate
  scopes               = [module.citizen-ui-draft-store.id]

  criteria {
    all_of {
      metric_criteria {
        metric_namespace     = each.value.criteria.allOf[0].metricNamespace
        metric_name          = each.value.criteria.allOf[0].metricName
        name                 = each.value.criteria.allOf[0].name
        threshold            = each.value.criteria.allOf[0].threshold
        operator             = each.value.criteria.allOf[0].operator
        aggregation          = each.value.criteria.allOf[0].aggregation
        skip_metric_validation = each.value.criteria.allOf[0].skipMetricValidation
      }
    }
  }

  dynamic "action" {
    for_each = each.value.action
    content {
      action_group_id = azurerm_monitor_action_group.this[action.value.action_group_name].id
    }
  }

  depends_on = [
    azurerm_monitor_action_group.this,
    module.citizen-ui-draft-store,
  ]
}
