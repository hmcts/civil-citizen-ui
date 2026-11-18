# Redis deployment configuration

PR previews use Azure Managed Redis through `values.preview.template.yaml`.
The preview template selects the environment's Managed Redis hostname, TLS port
10000 and `managed-redis-access-key`, mounted as `draft-store-access-key`.
Both the draft/journey and session clients use this connection and database 0.

Deploying a PR applies these settings automatically. New sessions and Redis-backed
journey entries are written to Managed Redis. This does not copy existing entries.
No separate values overlay or application feature flag is required.

The default and AAT templates retain the existing Azure Cache for Redis settings.
Later environment cutovers and removal of the old cache require separate rollout
and data-migration validation.
