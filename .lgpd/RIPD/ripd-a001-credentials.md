# RIPD — Conta e autenticação (A001)

**Versão**: v1-draft · 2026-09-16 · **Decisão pendente de Encarregado/jurídico**
**Skill**: `lgpd-ripd` (metodologia: teste Res. 2/2022 Art. 4 + ISO 31000)

## 1. Identificação
Atividade A001 (conta e autenticação) · Controlador: fast-backend (razão social a preencher) · Encarregado: pendente · Equipe: backend-implementer · Data: 2026-09-16.

## 2. Contexto e objetivo
Contas são o objeto do SaaS: sem autenticação não há produto. Stakeholders: titulares (usuários), operador da plataforma.

## 3. Descrição do tratamento
`POST /auth/register` (e-mail+senha) → `users` + `credentials(password_hash)` → login emite JWT curto + refresh opaco com rotation (`family_id`, `SELECT FOR UPDATE`, reuse revoga família) → `tokens_valid_after` p/ revogação global. Sistemas: Postgres, Redis (throttle). Operadores: nenhum (SMTP só no recovery, A003).

## 4. Necessidade e proporcionalidade
E-mail é o identificador mínimo viável; hash substitui senha em repouso; IP/UA só em tokens de sessão (antifraude). Alternativa rejeitada: login social (terceiriza risco p/ Google/GitHub — adiado por decisão, ADR 0007).

## 5. Princípios (Art. 6º)
Finalidade, adequação e necessidade: atendidos (mínimo funcional). Livre acesso/transparência: `/auth/me` + `PRIVACY.md`. Qualidade: validação Pydantic + e-mail canônico. Segurança/prevenção: Argon2id, rotation, throttling, anti-enumeração testada. Não discriminação: N/A (sem perfilamento).

## 6. Base legal
Art. 7º, V — execução de contrato (ver `.lgpd/legal-basis.md#A001`).

## 7. Direitos do titular
I/II via `/auth/me` (+export futuro); III via troca de senha (e-mail via fluxo futuro); VI via eliminação futura (L7); demais N/A ou via `PRIVACY_CONTACT`.

## 8. Riscos (ISO 31000)

| ID | Risco | P | I | Nível | Status |
|---|---|---|---|---|---|
| R001 | Vazamento da base (`users`+hashes) | 2 | 5 | 10 (alto) | mitigado (Argon2id custo alto; segredos fora de logs) |
| R002 | Força bruta em `/auth/login` | 3 | 3 | 9 (médio) | mitigado (throttling ip+e-mail, 429 testado) |
| R003 | Reuse/sequestro de sessão | 2 | 4 | 8 (médio) | mitigado (rotation+reuse→revoga família, `tokens_valid_after`) |
| R004 | Enumeração de contas | 2 | 3 | 6 (médio) | mitigado (401 genérico + dummy Argon2, testado) |

## 9. Salvaguardas
Técnicas: Argon2id calibrável, refresh opaco só-hash, lock atômico, throttling Redis, headers/CORS/hosts, containers non-root. Administrativas: Conventional Commits revisáveis, gates SAST, `test_leak_audit.py`. Organizacionais: segregação por módulos + `public.py`, sem acesso direto a credenciais fora do service.

## 10. Risco residual
Médio-baixo: R001 persiste como risco inerente a qualquer base de credenciais (mitigado, não eliminável). Aceitável **condicionado** a: sem vazamento conhecido, Argon2id mantido calibrado, throttling ativo.

## 11. Consulta a partes interessadas
Técnica: feita (esta auditoria). Titulares/Encarregado/jurídico/seg-info: **pendentes**.

## 12. Decisão
- [ ] Prosseguir como planejado
- [ ] Prosseguir com modificações: {quais}
- [ ] Não prosseguir
- [ ] Consultar ANPD previamente

**Aprovado por**: {Encarregado} · **Data**: {—}

## 13. Revisão
Anual ou ao mudar: algoritmo de hash, fluxo de sessão, incidente envolvendo credenciais.
