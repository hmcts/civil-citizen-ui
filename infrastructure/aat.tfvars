sku_name = "Basic"
family   = "C"
capacity = "1"

#================================================================================================
# Azure Monitor
#================================================================================================
monitor_action_group = {
  "civil-ci-slack-alert" = {
    short_name = "civilci"
    webhook_receiver = [
      { name = "civil-ci-alerts-web-hook" }
    ]
  }
}

monitor_metric_alerts = {
  "aat-civil-citizen-ui-draft-store-cpu-warning" = {
    description         = "AAT Civil Citizen UI draft store CPU usage equal to or above 65%",
    severity            = 2,
    enabled             = true,
    frequency           = "PT1M",
    autoMitigate        = true,
    window_size         = "PT5M"
    criteria = {
      allOf = [
        {
          operator             = "GreaterThanOrEqual",
          threshold            = 65,
          metricNamespace      = "Microsoft.Cache/Redis",
          metricName           = "percentProcessorTime",
          aggregation          = "Maximum",
          skipMetricValidation = false,
        }
      ]
    }
    action = [
      {
        action_group_name = "civil-ci-slack-alert"
      }
    ]
  }
  "aat-civil-citizen-ui-draft-store-cpu-critical" = {
    description         = "AAT Civil Citizen UI draft store CPU usage equal to or above 75%",
    severity            = 0,
    enabled             = true,
    frequency           = "PT1M",
    autoMitigate        = true,
    window_size         = "PT5M"
    criteria = {
      allOf = [
        {
          operator             = "GreaterThanOrEqual",
          threshold            = 75,
          metricNamespace      = "Microsoft.Cache/Redis",
          metricName           = "percentProcessorTime",
          aggregation          = "Maximum",
          skipMetricValidation = false,
        }
      ]
    }
    action = [
      {
        action_group_name = "civil-ci-slack-alert"
      }
    ]
  }
  "aat-civil-citizen-ui-draft-store-memory-warning" = {
    description         = "AAT Civil Citizen UI draft store memory usage equal to or above 65%",
    severity            = 2,
    enabled             = true,
    frequency           = "PT5M",
    autoMitigate        = true,
    window_size         = "PT15M"
    criteria = {
      allOf = [
        {
          operator             = "GreaterThanOrEqual",
          threshold            = 65,
          metricNamespace      = "Microsoft.Cache/Redis",
          metricName           = "usedmemorypercentage",
          aggregation          = "Maximum",
          skipMetricValidation = false,
        }
      ]
    }
    action = [
      {
        action_group_name = "civil-ci-slack-alert"
      }
    ]
  }
  "aat-civil-citizen-ui-draft-store-memory-critical" = {
    description         = "AAT Civil Citizen UI draft store memory usage equal to or above 75%",
    severity            = 0,
    enabled             = true,
    frequency           = "PT5M",
    autoMitigate        = true,
    window_size         = "PT15M"
    criteria = {
      allOf = [
        {
          operator             = "GreaterThanOrEqual",
          threshold            = 75,
          metricNamespace      = "Microsoft.Cache/Redis",
          metricName           = "usedmemorypercentage",
          aggregation          = "Maximum",
          skipMetricValidation = false,
        }
      ]
    }
    action = [
      {
        action_group_name = "civil-ci-slack-alert"
      }
    ]
  }
}
