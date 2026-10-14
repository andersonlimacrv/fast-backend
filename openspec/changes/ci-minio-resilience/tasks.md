# ci-minio-resilience — tasks

- [x] 1.1 `ServiceContainer`: bounded pull retry (3×, backoff 5s/15s) in `conftest.py` (`_pull_with_retry`, sem skip silencioso) + `MINIO_IMAGE` → mirror Docker Hub (mesma tag travada, override por env, allowlist hermética) — quay.io persistentemente bloqueado nos runners; Hub funciona (postgres/redis verdes)
- [x] 1.2 Unit test: transient-then-ok passes; always-fail raises (`test_service_container_pull.py`, 2 testes)
- [x] 1.3 Gates: ruff check + format limpos, unit 140/140; roundtrip **provado localmente contra o binário** (`MINIO_ENDPOINT_URL`, 1 passed — daemon docker irrelevante p/ esse caminho); CI: step corrigido após bug meu (nome do `.sha256sum` divergente; verificação agora compara hashes, imune a nome) — o verde no CI vem neste run
- [x] 1.4 CHANGELOG note (na entrada `ci-minio-resilience` abaixo)
- [ ] 1.5 Sem commit sem pedido
