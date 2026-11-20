# ci-minio-resilience — proposal

## Why

CI `integration` fails on `test_storage_s3.py::test_minio_roundtrip` at
fixture setup: MinIO image pulls are blocked from CI runners on BOTH
registries (quay.io 500 "unauthorized" on every attempt; Docker Hub "pull
access denied" — MinIO restricted anonymous pulls). Retry and mirror can't
fix a hard registry block. 106/107 pass. Unrelated to any feature diff.

## What Changes

- Fixture accepts a pre-started MinIO via `MINIO_ENDPOINT_URL` (no
  container, no pull): extracted `_settings_for`/`_storage_at` helpers, same
  bucket setup and roundtrip assertions. Proven locally against the release
  binary (1 passed, docker daemon irrelevant to this path).
- CI workflow `integration` job: downloads the pinned MinIO binary from
  GitHub Releases (same `RELEASE.2025-04-22T22-12-26Z` tag, sha256-verified —
  github.com egress already proven by the gitleaks step), starts it on
  `:9000`, exports `MINIO_ENDPOINT_URL`. Allowlist entry added (hermetic).
- Kept as fallback paths (not removed): Hub `MINIO_IMAGE` default for local
  dev with docker, bounded pull retry (3×, backoff) for transient blips,
  loud failure otherwise — no silent skip anywhere.
- Unit test for the retry (mocked docker client: fail twice, succeed third;
  fail always → raises).

## Non-goals

Silent `pytest.skip` on pull failure (would hide S3 coverage loss); touching
the roundtrip assertions; S3Mock/JVM doubles (real MinIO preserved).

## Acceptance criteria

1. Retry logic unit-tested (transient pass + persistent raise).
2. `test_storage_s3.py` green via the endpoint path (proven locally against
   the binary; CI proves it on runners); full unit suite green.
