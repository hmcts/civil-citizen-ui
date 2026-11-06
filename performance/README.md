# Performance testing tool

A reusable, on-demand performance testing tool for Civil, built on [k6](https://k6.io). Each epic adds a **suite**: a small k6 script describing its traffic. The tool supplies everything else:

- load profiles from smoke to breakpoint
- NFR thresholds
- test citizens from IDAM, cleaned up afterwards
- live database and pod metrics on previews
- an HTML report and before/after comparison

It never runs automatically. There is no CI job, no package script and no Docker image entry, ESLint ignores this folder, and `run.sh` refuses to start inside a pipeline.

## Requirements

- k6 (`brew install k6`)
- Node 24 (for the HTML report and comparison)
- VPN connected
- For server metrics on a preview: `kubectl` pointed at the preview cluster (`cft-preview-00-aks`)

## Run a suite

```bash
performance/run.sh <suite> --pr <PR number> --profile <profile> --label <name>

performance/run.sh draft-claim-store --pr 8498 --profile smoke
performance/run.sh draft-claim-store --pr 8498 --profile nfr --label before-fix --env SEED_EXPIRED=2000
performance/run.sh draft-claim-store --pr 8498 --profile nfr --label after-fix  --env SEED_EXPIRED=2000
node performance/tools/compare.js test-results/performance/<before run> test-results/performance/<after run>
```

`--pr` targets the suite's service preview, `https://<service>-pr-<n>.preview.platform.hmcts.net`. Use `--target <url>` for anything else.

| Option | Default | |
|---|---|---|
| `--profile <name>` | `smoke` | see the profiles table below |
| `--label <text>` | `run` | name for the run, e.g. `before-fix` |
| `--env KEY=VALUE` | | a suite setting, passed to the suite and its hooks (repeatable) |
| `--no-server-metrics` | | skip pod and database metrics |
| `--allow-shared` | | allow non-smoke profiles on AAT, demo or ITHC |

## Profiles

Every suite defines its traffic at 1x, normally the NFR from the release impact assessment. Profiles scale it:

| Profile | What it answers | Shape |
|---|---|---|
| `smoke` | Does everything work end to end? | 0.05x for 1 min |
| `nfr` | Do we meet the NFR? | 1x for 5 min |
| `load` | Is there headroom? | 2x for 10 min |
| `stress` | Where does it bend? | 1x, 2x, 3x, 4x, 5x in 2.5 min steps |
| `spike` | Does it survive a burst and recover? | 1x, 5x for 1 min, back to 1x |
| `soak` | Do connections or memory build up? | 1x for 60 min |
| `breakpoint` | Where does it break? | ramps to 10x and stops once the first key endpoint passes 5 s at p95 |

All traffic uses arrival rates (an open workload model). A slow service shows up as higher latency and dropped iterations, instead of quietly receiving fewer requests.

Pass criteria:

- p95 under the NFR (1,500 ms by default, `--env NFR_P95_MS=...`) for every endpoint and the control call
- errors under 0.1%
- no dropped iterations on the steady profiles (`nfr`, `load`, `soak`)
- the suite's own extra thresholds

## Output

Each run writes to `test-results/performance/<UTC time>_<suite>_<label>_<profile>/`, which git ignores:

| File | |
|---|---|
| `report.html` | the report: verdict, key results, endpoint table, failures, timelines for latency, throughput, DB connections and CPU |
| `k6-dashboard.html` | k6's own interactive dashboard |
| `summary.json`, `junit.xml` | raw summary (tokens removed) and CI-style threshold results |
| `timeseries.csv.gz`, `server-metrics.csv` | every request sample and every server sample |
| `suite.json`, `run-info.json` | what the suite tested, plus target, service image, timings and suite check results |

`tools/compare.js <before> <after>` writes `compare.html`, showing the change in every endpoint and the DB and CPU figures.

Server metrics on previews, sampled every 5 s:

- service and Postgres CPU and memory
- for the suite's database:
  - open connections
  - **new connections per second** (`pg_stat_database.sessions`)
  - transactions per second
  - active queries

## Add a suite for your epic

1. Copy `suites/_template` to `suites/<your-epic>`.
2. In `suite.conf`, set:
   - `SERVICE`: the preview host prefix, e.g. `civil-service` or `civil-citizen-ui`
   - `SERVICE_POD_KIND`: `java` or `nodejs`
   - `DB_NAME`: the database to watch
3. In `suite.js`:
   - **`META`:** what the report shows:
     - `title`
     - `endpoints`
     - `keyEndpoints`: the headline p95s
     - `control` (optional): a call that skips the database, which tells a database bottleneck apart from a service one
     - `events` (optional): one-off actions such as a scheduled job
     - `highlights`: your custom metrics
     - `traffic`: the 1x figures and where the NFR comes from
   - **`streams`:** one per kind of traffic, with its rate at 1x and the function that runs it
   - **The functions:** call your API through `core/http.js` `call()`, which tags requests by endpoint and checks the status
   - **`setup` and `teardown`:**
     - create test citizens with `core/idam.js`
     - clean up everything you create, including the IDAM users
4. Optional: in `hooks.sh`, use `suite_before_run` and `suite_after_run` for preparation and checks outside k6:
   - `db_sql "<sql>"` runs SQL against the preview database
   - `add_result "<label>" "<value>"` puts a line in the report's Suite checks panel
   - only write test data on previews (`ENV_KIND=preview`)
5. Run `performance/run.sh <your-epic> --pr <n>` with the smoke profile first.

## Safety

- **Targets:**
  - previews and perftest take any profile
  - AAT, demo and ITHC are shared, so only `smoke` runs there unless you pass `--allow-shared`
  - any other host is refused
- **Never automatic:** `run.sh` refuses to run when it detects CI (`CI`, `JENKINS_URL`, `GITHUB_ACTIONS`, `BUILD_URL`, `TF_BUILD`).
- **Suites clean up after themselves.** The draft claim store suite deletes its drafts and IDAM users, and seeded expired drafts are removed by the clean-up job.
- **Tokens:** IDAM tokens are stripped from `summary.json`, so run folders are safe to share.

## Layout

```
performance/
  run.sh                       entry point
  core/                        shared: environment, load profiles and thresholds, IDAM users, tagged HTTP calls, end-of-run summary
  suites/<suite>/              one per epic: suite.js, suite.conf, optional hooks.sh and data
  suites/_template/            starting point for a new suite
  tools/                       server metrics collector, HTML report, before/after comparison
```

## Suites

| Suite | Epic | What it covers |
|---|---|---|
| `draft-claim-store` | DTSCCI-5547 durable draft claims | the civil-service draft claims API and the CMC database; see its README |
