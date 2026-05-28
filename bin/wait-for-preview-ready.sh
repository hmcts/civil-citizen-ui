#!/bin/bash
set -e

NAMESPACE="civil"
RELEASE_PREFIX="civil-citizen-ui-pr-"
MAX_WAIT=600  # 10 minutes (increased for resource-constrained environments)
INTERVAL=15
HEALTH_CHECK_TIMEOUT=120  # 2 minutes for health check after pods ready

echo "Waiting for preview environment to be ready..."

# Extract PR number from current branch or environment
PR_NUM=${CHANGE_ID:-${BRANCH_NAME##*/}}
RELEASE="${RELEASE_PREFIX}${PR_NUM}"

echo "Checking pods for release: $RELEASE"

elapsed=0
resource_warning_shown=false

while [ $elapsed -lt $MAX_WAIT ]; do
  # Check for scheduling issues (resource constraints)
  SCHEDULING_ISSUES=$(kubectl get events -n $NAMESPACE --field-selector involvedObject.kind=Pod \
    --sort-by='.lastTimestamp' 2>/dev/null | grep -i "FailedScheduling\|Insufficient\|Too many pods" | tail -5 || true)
  
  if [ -n "$SCHEDULING_ISSUES" ] && [ "$resource_warning_shown" = false ]; then
    echo "⚠️  Warning: Detected resource scheduling issues in the cluster:"
    echo "$SCHEDULING_ISSUES"
    echo "Continuing to wait - pods may become ready once resources are available..."
    resource_warning_shown=true
  fi
  
  # Check if all pods are running and ready
  POD_STATUS=$(kubectl get pods -n $NAMESPACE -l "app.kubernetes.io/instance=$RELEASE" \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{.status.containerStatuses[0].ready}{"\n"}{end}' 2>/dev/null || true)
  
  if [ -z "$POD_STATUS" ]; then
    echo "⏳ No pods found yet for release $RELEASE, waiting... ($elapsed/$MAX_WAIT seconds)"
  else
    NOT_READY=$(echo "$POD_STATUS" | grep -v "Running.*true" | wc -l || true)
    
    if [ "$NOT_READY" -eq 0 ]; then
      echo "✓ All pods are ready!"
      
      # Additional check: verify civil-service health endpoint via external URL
      echo "Checking civil-service health..."
      HEALTH_URL="https://${RELEASE}-civil-service.preview.platform.hmcts.net/health"
      
      health_elapsed=0
      while [ $health_elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        if curl -sf --max-time 10 "$HEALTH_URL" > /dev/null 2>&1; then
          echo "✓ Civil-service is healthy!"
          echo "✓ Preview environment is fully ready"
          exit 0
        fi
        echo "⏳ Waiting for civil-service health endpoint... ($health_elapsed/$HEALTH_CHECK_TIMEOUT seconds)"
        sleep 10
        health_elapsed=$((health_elapsed + 10))
      done
      
      echo "⚠️  Warning: Health check timed out, but pods are ready. Proceeding anyway..."
      exit 0
    else
      echo "⏳ $NOT_READY pods not ready yet, waiting... ($elapsed/$MAX_WAIT seconds)"
    fi
  fi
  
  sleep $INTERVAL
  elapsed=$((elapsed + INTERVAL))
done

echo "❌ Timeout waiting for environment to be ready after ${MAX_WAIT} seconds"
echo ""
echo "Pod status:"
kubectl get pods -n $NAMESPACE -l "app.kubernetes.io/instance=$RELEASE" || true
echo ""
echo "Recent events:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20 || true
exit 1
