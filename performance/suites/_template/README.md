# Suite template

Copy this folder to `suites/<your-epic>` and follow "Add a suite for your epic" in `performance/README.md`.

What to change:

1. **`suite.conf`:**
   - the service whose preview you test
   - its pod kind
   - its database
2. **`META` in `suite.js`:**
   - title
   - endpoints and key endpoints
   - optional control call, events and highlights
   - the 1x traffic and where the NFR comes from
3. **`NFR_PER_SECOND` and `streams`:** one stream per kind of traffic.
4. **The stream functions:** replace the example `GET /health` call with your API calls through `call()`, giving each call an `endpoint` name and the expected statuses.
5. **`setup` and `teardown`:** create what the traffic needs, and delete everything you created.

Then run the smoke profile:

```bash
performance/run.sh <your-epic> --pr <PR number>
```
