# 🤖 AGENTS.md — Agentic AI & Developer Operating Guidelines

Welcome AI Assistants (Google Antigravity, Claude Code, Cursor) and Human Engineers!
This repository adheres to **Domain-Driven Action/Service Design Patterns**.

---

## 🎯 Domain Boundaries & Rules

1. **Controllers must stay Thin (< 150 lines)**:
   - Do NOT put complex business logic, lead scoring logic, or AI prompt generation inside HTTP Controllers.
   - Controllers should only handle Request Validation, delegate work to an Action in `app/Domain/*`, and return an Inertia/JSON response.

2. **Domain Action Classes (`app/Domain/<Subdomain>/Actions/`)**:
   - Every core business action has a single class containing an `execute()` method.
   - Examples: `ScoreLeadAction`, `TriggerCsHandoverAction`, `ProcessIncomingWaMessageAction`.

3. **Strong Typing & Enums (`app/Domain/<Subdomain>/Enums/`)**:
   - Use `LeadStatusEnum` instead of hardcoded strings like `'New Lead'` or `'Handover to CS'`.

4. **Security Invariants**:
   - All public WhatsApp Webhook endpoints MUST verify `WHATSAPP_WEBHOOK_SECRET` via `X-Gateway-Secret` header.
   - Do NOT disable SSL verification (`withoutVerifying()`) in production code.

5. **Testing Requirements**:
   - Always run `php artisan test` after adding or modifying domain actions.
