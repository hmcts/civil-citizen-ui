#!/bin/bash
set -e

NAMESPACE="civil"
RELEASE_PREFIX="civil-citizen-ui-pr-"
MAX_WAIT=300  # 5 minutes
INTERVAL=10

echo "Waiting for preview environment to be ready..."

# Extract PR number from current branch or environment
PR_NUM=${CHANGE_ID:-${BRANCH_NAME##*/}}
RELEASE="${RELEASE_PREFIX}${PR_NUM}"

echo "Checking pods for release: $RELEASE"

elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
  # Check if all pods are running and ready
  NOT_READY=$(kubectl get pods -n $NAMESPACE -l "app.kubernetes.io/instance=$RELEASE" \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{.status.containerStatuses[0].ready}{"\n"}{end}' \
    | grep -v "Running.*true" | wc -l || true)
  
  if [ "$NOT_READY" -eq 0 ]; then
    echo "✓ All pods are ready!"
    
    # Additional check: verify civil-service health endpoint
    echo "Checking civil-service health..."
    if kubectl exec -n $NAMESPACE -l "app.kubernetes.io/name=civil-service,app.kubernetes.io/instance=$RELEASE" \
      -- curl -sf http://localhost:4000/health > /dev/null 2>&1; then
      echo "✓ Civil-service is healthy!"
      exit 0
    else
      echo "⚠ Civil-service not responding yet, waiting..."
    fi
  else
    echo "⏳ $NOT_READY pods not ready yet, waiting... ($elapsed/$MAX_WAIT seconds)"
  fi
  
  sleep $INTERVAL
  elapsed=$((elapsed + INTERVAL))
done

echo "❌ Timeout waiting for environment to be ready"
kubectl get pods -n $NAMESPACE -l "app.kubernetes.io/instance=$RELEASE"
exit 1
