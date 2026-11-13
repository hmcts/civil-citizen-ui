#!/bin/bash
set -u

OUT=$1
NAMESPACE=$2
SERVICE_POD=$3
DB_POD=$4
DB_NAME=$5
INTERVAL=${6:-5}
DB_CONTAINER=${7:-postgresql}

echo "timestamp,service_cpu_m,service_mem_mi,db_cpu_m,db_mem_mi,db_open_connections,db_sessions_total,db_transactions_total,db_active_queries,all_db_open_connections" > "$OUT"

usage() {
  kubectl top pod -n "$NAMESPACE" "$1" --no-headers 2>/dev/null | awk '{gsub("m","",$2); gsub("Mi","",$3); print $2","$3}'
}

STATS_SQL="select coalesce(sum(numbackends) filter (where datname='$DB_NAME'),0), coalesce(sum(sessions) filter (where datname='$DB_NAME'),0), coalesce(sum(xact_commit + xact_rollback) filter (where datname='$DB_NAME'),0), (select count(*) from pg_stat_activity where datname='$DB_NAME' and state='active'), sum(numbackends) from pg_stat_database"

while true; do
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  service=$(usage "$SERVICE_POD")
  db=$(usage "$DB_POD")
  stats=$(kubectl exec -n "$NAMESPACE" "$DB_POD" -c "$DB_CONTAINER" -- sh -c "PGPASSWORD=\"\$(cat \"\$POSTGRES_POSTGRES_PASSWORD_FILE\")\" psql -h 127.0.0.1 -U postgres -d postgres -AtF, -c \"$STATS_SQL\"" 2>/dev/null)
  echo "$timestamp,${service:-,},${db:-,},${stats:-,,,,}" >> "$OUT"
  sleep "$INTERVAL"
done
