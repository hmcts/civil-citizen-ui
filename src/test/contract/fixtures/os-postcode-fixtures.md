# OS Places postcode contract fixture provenance

The consumer-side schema subset in `os-postcode-response.schema.json` is based on the official OS Places API Postcode technical specification and the DPA/LPI dataset documentation:

- Postcode operation: https://docs.os.uk/os-apis/accessing-os-apis/os-places-api/technical-specification/postcode
- DPA and LPI field definitions: https://docs.os.uk/os-apis/accessing-os-apis/os-places-api/datasets

The documentation permits `dataset=DPA,LPI` and documents different DPA and LPI address fields. The technical specification is maintained as online documentation and does not identify a released semantic schema version. Review the linked specification when refreshing fixtures; last checked 2026-09-22. Fixtures use synthetic, non-personal address values and are intentionally limited to fields consumed by CUI. These HTTP-boundary tests use the real Axios service call intercepted locally; they are consumer/schema checks and do not represent OS provider verification or a Pact Broker publication.
