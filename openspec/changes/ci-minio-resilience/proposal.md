# ci-minio-resilience — proposal

## Why

CI `integration` fails on `test_storage_s3.py::test_minio_roundtrip` at
fixture setup: `quay.io/minio/minio` is persistently unreachable from CI
runners (500 "unauthorized" on every pull attempt — retry alone can't fix a
hard registry block; confirmed over two runs). 106/107 pass. Unrelated to
any feature diff; main-branch CI already showed the same intermittency
(fail 09-17, pass 09-19).

## What Changes

- `MINIO_IMAGE` → Docker Hub mirror (`minio/minio`, same pinned tag
  `RELEASE.2025-04-22T22-12-26Z`), with `MINIO_IMAGE` env override + hermetic
  allowlist entry (house pattern, like `POSTGRES_IMAGE`/`REDIS_IMAGE`).
  Evidence: Hub pulls demonstrably work on these runners (postgres/redis
  green); MinIO publishes every release mirrored quay.io↔docker.io.
  Worst case = same red as today; likely case = green.
- Bounded pull retry kept as belt-and-suspenders (transient blips on any
  registry): 3 attempts, exponential backoff, loud failure — no silent skip.
- Unit test for the retry (mocked docker client: fail twice, succeed third;
  fail always → raises).

## Non-goals

Image mirror swap (same failure class on Docker Hub rate limits); silent
`pytest.skip` on pull failure (would hide S3 coverage loss); touching the
S3 test itself.

## Acceptance criteria

1. Retry logic unit-tested (transient pass + persistent raise).
2. `test_storage_s3.py` passes locally with cached image; full unit suite green.
