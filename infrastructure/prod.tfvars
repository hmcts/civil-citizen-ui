sku_name                        = "Premium"
family                          = "P"
capacity                        = "2"
maxmemory_reserved              = 1330
maxfragmentationmemory_reserved = 1330
maxmemory_delta                 = 1330

#================================================================================================
# Azure Monitor
#================================================================================================
civil_ci_alert_slack_email_secret_name = "civil-ci-alert-slack-group-email"

monitor_action_group = {
  "prod-civil-ci-slack-alert" = {
    short_name = "civilci-prod"
  }
}

monitor_metric_alerts = {
  "prod-civil-citizen-ui-draft-store-cpu-warning" = {
    description  = "Production Civil Citizen UI draft store CPU usage equal to or above 65%",
    severity     = 2,
    enabled      = true,
    frequency    = "PT1M",
    autoMitigate = true,
    window_size  = "PT5M"
    criteria = [
      {
        operator             = "GreaterThanOrEqual",
        threshold            = 65,
        metricNamespace      = "Microsoft.Cache/Redis",
        metricName           = "percentProcessorTime",
        aggregation          = "Maximum",
        skipMetricValidation = false,
      }
    ]
    action = [
      {
        action_group_name = "prod-civil-ci-slack-alert"
      }
    ]
  }
  "prod-civil-citizen-ui-draft-store-cpu-critical" = {
    description  = "Production Civil Citizen UI draft store CPU usage equal to or above 75%",
    severity     = 0,
    enabled      = true,
    frequency    = "PT1M",
    autoMitigate = true,
    window_size  = "PT5M"
    criteria = [
      {
        operator             = "GreaterThanOrEqual",
        threshold            = 75,
        metricNamespace      = "Microsoft.Cache/Redis",
        metricName           = "percentProcessorTime",
        aggregation          = "Maximum",
        skipMetricValidation = false,
      }
    ]
    action = [
      {
        action_group_name = "prod-civil-ci-slack-alert"
      }
    ]
  }
  "prod-civil-citizen-ui-draft-store-memory-warning" = {
    description  = "Production Civil Citizen UI draft store memory usage equal to or above 65%",
    severity     = 2,
    enabled      = true,
    frequency    = "PT5M",
    autoMitigate = true,
    window_size  = "PT15M"
    criteria = [
      {
        operator             = "GreaterThanOrEqual",
        threshold            = 65,
        metricNamespace      = "Microsoft.Cache/Redis",
        metricName           = "usedmemorypercentage",
        aggregation          = "Maximum",
        skipMetricValidation = false,
      }
    ]
    action = [
      {
        action_group_name = "prod-civil-ci-slack-alert"
      }
    ]
  }
  "prod-civil-citizen-ui-draft-store-memory-critical" = {
    description  = "Production Civil Citizen UI draft store memory usage equal to or above 75%",
    severity     = 0,
    enabled      = true,
    frequency    = "PT5M",
    autoMitigate = true,
    window_size  = "PT15M"
    criteria = [
      {
        operator             = "GreaterThanOrEqual",
        threshold            = 75,
        metricNamespace      = "Microsoft.Cache/Redis",
        metricName           = "usedmemorypercentage",
        aggregation          = "Maximum",
        skipMetricValidation = false,
      }
    ]
    action = [
      {
        action_group_name = "prod-civil-ci-slack-alert"
      }
    ]
  }
}
