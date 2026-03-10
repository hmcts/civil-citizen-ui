resource "azurerm_logic_app_workflow" "civil_ci_alert_logic_app" {
  count               = local.civil_ci_alert_slack_webhook_url != null ? 1 : 0
  name                = "civil-ci-alert-logic-app-${var.env}"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  tags                = var.common_tags
}

resource "azurerm_logic_app_trigger_http_request" "civil_ci_alert_trigger" {
  count        = local.civil_ci_alert_slack_webhook_url != null ? 1 : 0
  name         = "civil-ci-alert-trigger"
  logic_app_id = azurerm_logic_app_workflow.civil_ci_alert_logic_app[0].id

  schema = <<SCHEMA
{
    "type": "object",
    "properties": {
        "schemaId": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "properties": {
                "essentials": {
                    "type": "object",
                    "properties": {
                        "alertRule": {
                            "type": "string"
                        },
                        "severity": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        },
                        "firedDateTime": {
                            "type": "string"
                        }
                    }
                }
            }
        }
    }
}
SCHEMA
}

resource "azurerm_logic_app_action_http" "civil-ci-slack_webhook" {
  count        = local.civil_ci_alert_slack_webhook_url != null ? 1 : 0
  name         = "civil-ci-slack-webhook"
  logic_app_id = azurerm_logic_app_workflow.civil_ci_alert_logic_app[0].id
  method       = "POST"
  uri          = local.civil_ci_alert_slack_webhook_url

  # Slack message formatting using blocks for better layout and readability.
  body = <<BODY
{
    "blocks": [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "🚨 Azure Monitor Alert: @{triggerBody()?['data']?['essentials']?['alertRule']}",
                "emoji": true
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Severity:*\n@{triggerBody()?['data']?['essentials']?['severity']}"
                },
                {
                    "type": "mrkdwn",
                    "text": "*Environment:*\n${var.env}"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Description:*\n@{triggerBody()?['data']?['essentials']?['description']}"
            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Triggered at @{triggerBody()?['data']?['essentials']?['firedDateTime']}"
                }
            ]
        }
    ]
}
BODY

  depends_on = [
    azurerm_logic_app_trigger_http_request.civil_ci_alert_trigger
  ]
}
