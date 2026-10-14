# ci-minio-resilience — tasks

- [x] 1.1 `ServiceContainer`: bounded pull retry (3×, backoff 5s/15s) in `conftest.py` (`_pull_with_retry`, sem skip silencioso)
- [x] 1.2 Unit test: transient-then-ok passes; always-fail raises (`test_service_container_pull.py`, 2 testes)
- [x] 1.3 Gates: ruff check + format limpos, unit 140/140; minio roundtrip segue errando alto aqui e no CI (registry bloqueado — retry esgota e levanta, como desenhado; o verde real vem no rerun do CI)
- [x] 1.4 CHANGELOG note (na entrada `ci-minio-resilience` abaixo)
- [ ] 1.5 Sem commit sem pedido
