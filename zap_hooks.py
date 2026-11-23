def zap_started(zap, target):
  rules_to_ignore = ()
  for rule in rules_to_ignore:
    zap.pscan.set_scanner_alert_threshold(id=rule, alertthreshold='OFF')
