# ci-minio-resilience — proposal

## Why

CI `integration` fails on `test_storage_s3.py::test_minio_roundtrip` at
fixture setup (`conftest.py:215`): the `quay.io/minio/minio` pull flops with
transient registry errors (observed: 500 "unauthorized", then 404
ImageNotFound on rerun). 106/107 pass. The pull has no retry — one blip
kills the job. Unrelated to any feature diff; main-branch CI already showed
the same intermittency (fail 09-17, pass 09-19).

## What Changes

- `app/tests/conftest.py` `ServiceContainer`: pull with bounded retry
  (3 attempts, exponential backoff) before giving up with the real error.
  Class-wide benefit (postgres/redis/mailpit pulls share the path). No
  silent skip — persistent failure still errors loudly.
- Unit test for the retry (mocked docker client: fail twice, succeed third;
  fail always → raises).

## Non-goals

Image mirror swap (same failure class on Docker Hub rate limits); silent
`pytest.skip` on pull failure (would hide S3 coverage loss); touching the
S3 test itself.

## Acceptance criteria

1. Retry logic unit-tested (transient pass + persistent raise).
2. `test_storage_s3.py` passes locally with cached image; full unit suite green.
