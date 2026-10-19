#!/bin/bash
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"

usage() {
  cat <<EOF
Usage: performance/run.sh <suite> (--pr <PR number> | --target <url>) [options]

Suites: $(ls "$HERE/suites" | grep -v '^_' | tr '\n' ' ')

  --profile <name>       smoke | nfr | load | stress | spike | soak | breakpoint   (default: smoke)
  --label <text>         name for this run, e.g. before-pooling                     (default: run)
  --env KEY=VALUE        setting passed to the suite and its hooks (repeatable)
  --no-server-metrics    skip pod and database metrics
  --allow-shared         allow non-smoke profiles on shared environments (AAT, demo, ITHC)

This tool is for manual, on-demand runs. It refuses to start inside a CI pipeline.
EOF
  exit 1
}

[ $# -lt 1 ] && usage
SUITE=$1
shift
SUITE_DIR="$HERE/suites/$SUITE"
{ [ "${SUITE#_}" != "$SUITE" ] || [ ! -f "$SUITE_DIR/suite.js" ]; } && { echo "Unknown suite '$SUITE'."; usage; }

if [ -n "${CI:-}${JENKINS_URL:-}${GITHUB_ACTIONS:-}${BUILD_URL:-}${TF_BUILD:-}" ]; then
  echo "Refusing to run: this looks like a CI pipeline. The performance tool only runs by hand."
  exit 1
fi

PR="" TARGET="" PROFILE="smoke" LABEL="run" SERVER_METRICS=true ALLOW_SHARED=false
SUITE_ENV=()
while [ $# -gt 0 ]; do
  case "$1" in
    --pr) PR=$2; shift 2 ;;
    --target) TARGET=$2; shift 2 ;;
    --profile) PROFILE=$2; shift 2 ;;
    --label) LABEL=$2; shift 2 ;;
    --env) SUITE_ENV+=("$2"); shift 2 ;;
    --no-server-metrics) SERVER_METRICS=false; shift ;;
    --allow-shared) ALLOW_SHARED=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option $1"; usage ;;
  esac
done
[ -z "$PR" ] && [ -z "$TARGET" ] && usage

SERVICE="" SERVICE_POD_KIND=java DB_POD_SUFFIX=postgresql-0 DB_CONTAINER=postgresql DB_NAME=""
[ -f "$SUITE_DIR/suite.conf" ] && . "$SUITE_DIR/suite.conf"
for pair in ${SUITE_ENV[@]+"${SUITE_ENV[@]}"}; do
  export "${pair?}"
done

NAMESPACE=civil
if [ -n "$PR" ]; then
  [ -z "$SERVICE" ] && { echo "Suite '$SUITE' has no SERVICE in suite.conf, so use --target."; exit 1; }
  TARGET="https://${SERVICE}-pr-${PR}.preview.platform.hmcts.net"
fi
TARGET="${TARGET%/}"
HOST=$(echo "$TARGET" | sed -E 's#https?://([^/]+).*#\1#')

case "$HOST" in
  *.preview.platform.hmcts.net) ENV_KIND=preview ;;
  *perftest*) ENV_KIND=perftest ;;
  *aat*|*demo*|*ithc*) ENV_KIND=shared ;;
  *) echo "Refusing to run against $HOST: only preview, perftest, AAT, demo or ITHC targets are allowed."; exit 1 ;;
esac
if [ "$ENV_KIND" = shared ] && [ "$PROFILE" != smoke ] && [ "$ALLOW_SHARED" != true ]; then
  echo "$HOST is shared by other teams: only the smoke profile runs there unless you pass --allow-shared."
  exit 1
fi

command -v k6 >/dev/null || { echo "k6 is not installed (brew install k6)"; exit 1; }
NODE=$(command -v node || ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
RUN_ID=$(date +%s)
export RUN_ID ENV_KIND
SAFE_LABEL=$(echo "$LABEL" | tr -c 'A-Za-z0-9._-' '-' | sed 's/-*$//')
DIR="$REPO/test-results/performance/${STAMP}_${SUITE}_${SAFE_LABEL}_${PROFILE}"
mkdir -p "$DIR"
RESULTS_FILE="$DIR/.suite-results"
: > "$RESULTS_FILE"

SERVICE_POD="" DB_POD="" SERVICE_IMAGE=""
if [ "$ENV_KIND" = preview ] && [ -n "$PR" ]; then
  SERVICE_POD=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | awk -v p="${SERVICE}-pr-${PR}-${SERVICE_POD_KIND}-" 'index($1,p)==1 && $3=="Running" {print $1; exit}')
  DB_POD="${SERVICE}-pr-${PR}-${DB_POD_SUFFIX}"
  SERVICE_IMAGE=$(kubectl get pod -n $NAMESPACE "$SERVICE_POD" -o jsonpath='{.spec.containers[0].image}' 2>/dev/null)
  if [ -z "$SERVICE_POD" ]; then
    echo "Could not find a running ${SERVICE} pod for PR $PR (kubectl context: $(kubectl config current-context 2>/dev/null)). Server metrics will be skipped."
    SERVER_METRICS=false
  fi
else
  SERVER_METRICS=false
fi
[ -z "$DB_NAME" ] && SERVER_METRICS=false

db_sql() {
  [ -z "$DB_POD" ] && return 1
  kubectl exec -n $NAMESPACE "$DB_POD" -c "$DB_CONTAINER" -- sh -c "PGPASSWORD=\"\$(cat \"\$POSTGRES_POSTGRES_PASSWORD_FILE\")\" psql -h 127.0.0.1 -U postgres -d $DB_NAME -Atc \"$1\""
}

add_result() {
  printf '%s\t%s\n' "$1" "$2" >> "$RESULTS_FILE"
}

suite_before_run() { :; }
suite_after_run() { :; }
[ -f "$SUITE_DIR/hooks.sh" ] && . "$SUITE_DIR/hooks.sh"

suite_before_run || { echo "The suite's preparation step failed."; exit 1; }

STARTED=$(date -u +%Y-%m-%dT%H:%M:%SZ)
COLLECTOR_PID=""
if [ "$SERVER_METRICS" = true ]; then
  bash "$HERE/tools/collect-server-metrics.sh" "$DIR/server-metrics.csv" $NAMESPACE "$SERVICE_POD" "$DB_POD" "$DB_NAME" 5 "$DB_CONTAINER" &
  COLLECTOR_PID=$!
  disown $COLLECTOR_PID 2>/dev/null
  trap '[ -n "$COLLECTOR_PID" ] && kill $COLLECTOR_PID 2>/dev/null' EXIT
  sleep 12
fi

K6_ENV=(-e TARGET_URL="$TARGET" -e PROFILE="$PROFILE" -e RUN_ID="$RUN_ID" -e RESULTS_DIR="$DIR")
for pair in ${SUITE_ENV[@]+"${SUITE_ENV[@]}"}; do
  K6_ENV+=(-e "$pair")
done

echo "Running suite '$SUITE', profile '$PROFILE', against $TARGET"
echo "Results: $DIR"
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_OPEN=false K6_WEB_DASHBOARD_PERIOD=5s K6_WEB_DASHBOARD_EXPORT="$DIR/k6-dashboard.html" \
k6 run --quiet --out "csv=$DIR/timeseries.csv.gz" "${K6_ENV[@]}" "$SUITE_DIR/suite.js" 2>&1 | grep -v -E '^\s*$' | tee "$DIR/k6-console.log"
K6_EXIT=${PIPESTATUS[0]}
FINISHED=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ -n "$COLLECTOR_PID" ]; then
  sleep 12
  kill $COLLECTOR_PID 2>/dev/null
  COLLECTOR_PID=""
fi

suite_after_run

python3 - "$DIR/run-info.json" "$RESULTS_FILE" "${SUITE_ENV[@]+"${SUITE_ENV[@]}"}" <<EOF
import json, sys
out, results_file, pairs = sys.argv[1], sys.argv[2], sys.argv[3:]
results = dict(line.rstrip('\n').split('\t', 1) for line in open(results_file) if '\t' in line)
json.dump({
  "suite": "$SUITE", "label": "$LABEL", "profile": "$PROFILE", "target": "$TARGET", "pr": "$PR", "environment": "$ENV_KIND",
  "startedAt": "$STARTED", "finishedAt": "$FINISHED", "runId": "$RUN_ID",
  "servicePod": "$SERVICE_POD", "dbPod": "$DB_POD", "serviceImage": "$SERVICE_IMAGE",
  "env": dict(pair.split('=', 1) for pair in pairs if '=' in pair),
  "suiteResults": results,
  "k6Version": "$(k6 version 2>/dev/null | head -1)", "k6ExitCode": $K6_EXIT
}, open(out, "w"), indent=2)
EOF
rm -f "$RESULTS_FILE"

if [ -f "$HERE/tools/report.js" ] && [ -n "$NODE" ]; then
  "$NODE" "$HERE/tools/report.js" "$DIR" >/dev/null && echo "Report: $DIR/report.html"
fi
echo "k6 dashboard: $DIR/k6-dashboard.html"
exit $K6_EXIT
