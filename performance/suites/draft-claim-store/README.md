# Suite: draft-claim-store

The civil-service draft claims API (`/dashboard/draft-claims`) for epic DTSCCI-5547. Every Citizen UI claim page calls it when `cui-draft-claim-database` is on.

## Traffic at 1x

1x is the release IA target: 20 reads/s and 4 writes/s, with a 30% uplift.

| Stream | Rate | What it does |
|---|---|---|
| Page reads | 24/s | `GET /active`, as each claim page does |
| Page saves | 3.8/s | `PUT /{id}` with a full claim payload |
| Journeys | 0.1/s | create → 10 × (read, save, read back and check the value) → link to a case → read by case → payment retention → delete |
| Control | 1/s | a civil-service call that does not touch the database |
| Clean-up job | once | `ExpiredDraftStore`, about 45% of the way through |

Extra pass criteria:

- page cycle (read, save, read back) p95 under the NFR
- zero data-integrity failures, meaning a value that saved fine but read back differently

## Run it

```bash
performance/run.sh draft-claim-store --pr <civil-service PR> --profile smoke
performance/run.sh draft-claim-store --pr <civil-service PR> --profile nfr --label before-change --env SEED_EXPIRED=2000
performance/run.sh draft-claim-store --pr <civil-service PR> --profile nfr --label after-change --env SEED_EXPIRED=2000
node performance/tools/compare.js test-results/performance/<before run> test-results/performance/<after run>
```

The target is the civil-service preview for that PR. The suite only calls the draft claims API, so no Citizen UI preview is needed. Server metrics come from the preview's own Postgres pod, `civil-service-pr-<n>-postgresql-0`.

## Settings (`--env`)

| Setting | Default | |
|---|---|---|
| `SEED_EXPIRED` | `0` | adds that many expired drafts first, so the clean-up job works under load (preview only) |
| `PAYLOAD` | `standard` | `large` stretches the timeline, evidence and amount rows |
| `PAGES_PER_JOURNEY` | `10` | pages saved per journey |
| `READ_POOL` | `25` | citizens with drafts shared by page reads and saves |
| `CLEANUP_JOB` | `true` | trigger `ExpiredDraftStore` during the run |

## Results so far

| Run | Result |
|---|---|
| 16 Oct, pr-8498, before pooling, `nfr` | 191 HTTP 500s in one burst, ~67 new DB connections per second |
| 19 Oct, pr-8498, after pooling, `nfr` | p95 157 ms for reads, no errors, 6 new DB connections in the whole run |
| 19 Oct, pr-8498, after pooling, `stress` up to 5x | 0 errors, p95 flat at ~170 ms |
