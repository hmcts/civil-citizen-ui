# Redis deployment values

The default values continue using Azure Cache for Redis. Managed Redis infrastructure
and its separate Key Vault secret already exist alongside it.

To switch an environment, apply `values.managed-redis.yaml` **after** its normal
values. For preview, also apply `values.managed-redis.preview.yaml` last
to preserve its distinct non-production LaunchDarkly secret. AAT uses the same
secret name as the default values and needs only the common override. These files are opt-in:
Jenkins does not load them automatically. In Flux, apply their equivalent
`nodejs.environment` and `nodejs.keyVaults.civil-cui.secrets` overrides to the
chosen environment's HelmRelease. Helm replaces secret lists rather than merging
individual entries; retain all the other secrets when applying an override.

The host, TLS port 10000 and `managed-redis-access-key` must change together.
The key is mounted under the existing `draft-store-access-key` alias, used by both
the draft/journey and session clients. EnterpriseCluster provides their single
endpoint, and both use database 0. TLS certificate verification stays enabled.

Validate in a lower environment first, with the CMC draft-store release/feature-flag
state confirmed. Before switching, coordinate data migration with Platform Operations,
preserving key names and remaining TTLs, and prevent writes being split between
old and new caches during migration and rolling deployment. The CMC feature flag
does not migrate sessions or other journey/payment/GA keys.

Check existing draft recovery, login/session continuity, journey writes and TTLs,
payment and GA journeys with the CMC draft flag both off and on. Verify Redis health
and no authentication, certificate or MOVED errors. Do not print keys or payloads.

Retain the old cache and secret until cutover is accepted in every environment.
Reverting configuration alone after new writes is not a safe data rollback:
reconcile new/changed keys and remaining TTLs before moving traffic back. Removal
of the old Terraform module requires that acceptance and a reviewed state-backed
plan; this change does not destroy infrastructure or activate a cutover.
