# Política de Privacidade — fast-backend (DRAFT v1.0)

> **STATUS: RASCUNHO — NÃO PUBLICAR sem revisão jurídica e sem Encarregado designado.**
> Versão 1.0-draft · 2026-09-16 · cobre LGPD Art. 9 (7 elementos + recomendados).

## Resumo (TL;DR)

Coletamos o mínimo para sua conta funcionar (e-mail, senha em hash, registros de segurança). Sem trackers, sem marketing, sem venda de dados. Você pode ver, corrigir e pedir a eliminação dos seus dados. Dúvidas: `PRIVACY_CONTACT` (a definir).

## 1. Finalidade específica

Operar sua conta no SaaS: cadastro, login, organizações e projetos, recuperação de senha, segurança e suporte. Nada além disso.

## 2. Forma e duração

Tratamento automatizado em banco de dados próprio. Duração: enquanto a conta existir; resíduos com purge automático (resets) e regras documentadas em `.lgpd/retention.md`. Backups cifrados com retenção configurada.

## 3. Identificação do controlador

- **Razão social**: {preencher}
- **CNPJ**: {preencher}
- **Endereço**: {preencher}

## 4. Contato do controlador/encarregado

- **E-mail**: {`PRIVACY_CONTACT` — definir antes da produção}
- **Encarregado**: {pendente designação — gap crítico}

## 5. Uso compartilhado

| Com quem | Para quê | Base |
|---|---|---|
| Provedor SMTP (por deploy) | e-mails transacionais (recovery) | contrato |
| Storage S3 (por deploy) | objetos enviados por você | contrato |
| Stripe (só se billing ligado) | assinaturas (sem cartão nosso) | contrato |
| Hospedagem VPS (por deploy) | infraestrutura | contrato |

Detalhes e due diligence em `.lgpd/vendors/`. Sem venda, sem marketing, sem analytics de terceiros.

## 6. Responsabilidades

Controlador (nós): finalidades, segurança, resposta a direitos e incidentes. Operadores (tabela acima): tratar só sob instrução, com DPA assinado — **sem DPA, sem tráfego produtivo**.

## 7. Direitos do titular (Art. 18)

Confirmação, acesso (`GET /auth/me`), correção (troca de senha; demais vias em construção), anonimização/bloqueio, portabilidade e eliminação (fluxo em construção — ver `.lgpd/dsar/workflow.md`), informação sobre compartilhamento e sobre não consentir. Prazo de resposta: 15 dias. Reclamação à ANPD: https://www.gov.br/anpd.

## 8. Bases legais por finalidade

Conta/sessão/recovery/orgs/billing: execução de contrato (Art. 7º, V). Auditoria e administração: legítimo interesse + guarda de registros (Art. 7º, IX; Art. 16, I). Detalhe em `.lgpd/legal-basis.md`.

## 9. Transferências internacionais

Possíveis conforme o deploy (ex.: Stripe EUA, SMTP/S3 por região). Só com base do Art. 33 (Cláusulas-Padrão Res. 19/2024 ou equivalente), registrada em `.lgpd/vendors/`.

## 10. Retenção

Conforme `.lgpd/retention.md` (resets com purge automático; demais regras propostas aguardando aprovação).

## 11. Cookies e tecnologias similares

Navegador de demonstração: tokens em `localStorage` (dev only). Produção: cookies `HttpOnly` + CSRF. Zero trackers, zero fontes/CDN de terceiros.

## 12. Mudanças nesta política

Versões em `.lgpd/policies/` com changelog; mudanças materiais comunicadas aos titulares ativos; histórico preservado.

## 13. Vigência e changelog

- v1.0-draft (2026-09-16): primeira versão, a partir de `.lgpd/data-map.md` e `docs/PRIVACY.md`.
