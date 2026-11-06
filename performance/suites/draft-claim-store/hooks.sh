suite_before_run() {
  if [ "${SEED_EXPIRED:-0}" = 0 ]; then
    return 0
  fi
  if [ "$ENV_KIND" != preview ]; then
    echo "SEED_EXPIRED writes test rows into the database, so it only runs on a preview."
    return 1
  fi
  echo "Adding $SEED_EXPIRED expired drafts for the clean-up job..."
  db_sql "insert into dbs.draft_store (id, user_id, case_id, draft_type, payload, created_at, updated_at, expires_at) select gen_random_uuid(), 'perf-expired-${RUN_ID}-' || g, null, 'DRAFT_CLAIM', '{}'::jsonb, now() - interval '40 days', now() - interval '40 days', now() - interval '1 day' from generate_series(1, ${SEED_EXPIRED}) g" >/dev/null || return 1
  add_result "Expired drafts loaded" "$SEED_EXPIRED"
}

suite_after_run() {
  if [ "${SEED_EXPIRED:-0}" = 0 ]; then
    return 0
  fi
  local left
  left=$(db_sql "select count(*) from dbs.draft_store where user_id like 'perf-expired-${RUN_ID}-%'" 2>/dev/null)
  echo "Expired drafts left after the run: ${left:-unknown} of $SEED_EXPIRED"
  add_result "Expired drafts left after the run" "${left:-unknown}"
}
