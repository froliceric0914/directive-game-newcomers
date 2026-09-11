# Agent workflow

## Core principle

For meaningful product uncertainty, subjective design choices, or multiple reasonable approaches, follow:

**PREVIEW → HUMAN SELECTION → CONFIRM → IMPLEMENT**

Detect expectation mismatch before substantial reasoning, planning, or implementation. This file defines how agents work; keep product requirements in separate project documentation.

## 1. Minimal preflight

Present 2–3 short directions, normally no more than 80 tokens each. Describe only the user's experience, available actions, core interaction, and the difference between options. Use:

> A — Name  
> Experience: …  
> Interaction: …  
> Difference: …

Repeat for B and, when useful, C. Do not write code, modify files, install dependencies, design detailed architecture, provide long explanations, or perform speculative implementation at this stage. **Stop and wait for the user's response.**

## 2. Human selection

The user may select, combine, reject, modify, or request alternatives. Treat that feedback as a product decision; do not silently override it. Selection alone is not implementation approval.

## 3. Implementation preview and confirmation

After selection, provide one concise preview covering:

- Intended user experience and user flow.
- Major behavior and components.
- Prototype scope.

Resolve remaining meaningful product ambiguity before implementation. Once the direction is clear, **wait for explicit approval before substantial implementation**. Reuse approval already given for the same scope; do not create duplicate gates.

## 4. Implementation

After approval:

1. Inspect the existing codebase and conventions.
2. Identify the smallest coherent implementation of the approved scope.
3. Preserve existing conventions and implement only that scope.
4. Test relevant behavior.
5. Report important changes and unresolved issues.

Do not silently expand scope or redesign approved behavior because a different approach is technically easier. Return to alignment when a necessary change materially departs from the approved direction.

## When to use preflight

Use preflight for new product features, gameplay or narrative mechanics, interaction design, UX/UI structure, visual direction, major behavioral changes, architecture decisions materially affecting the product, and ambiguous requirements with multiple reasonable outcomes.

Proceed directly for clearly specified, low-ambiguity work: specific bug fixes, typos, explicit value updates, lint/type fixes, clearly specified tests, straightforward refactoring, and implementation of an already-approved specification. **Do not create unnecessary approval gates.**

## Product and technical decisions

Align with the user on experience, interaction models, information hierarchy, mechanics, visual direction, and feature scope.

Handle routine technical details autonomously: naming, internal data structures, small refactors, test organization, and implementation consistent with existing architecture. Escalate technical decisions only when they materially affect product behavior, maintainability, security, performance, cost, architecture, or future constraints.

## Efficient exploration and prototyping

- Prefer small alternatives → human decision → focused planning → implementation.
- Under high uncertainty, spend tokens on breadth rather than depth. Avoid extensive speculative reasoning or implementation that may need to be discarded.
- After approval, focus reasoning on implementation quality.
- For an uncertain idea, choose the cheapest prototype that lets the user evaluate whether it works.
- Do not introduce unnecessary production infrastructure, backends, databases, authentication, abstractions, or architecture to validate an unproven interaction.

## Preserve decisions

Record important, durable approvals, rejections, and modifications in appropriate project documentation. Do not repeatedly propose rejected directions unless requirements change or new evidence materially changes the tradeoff.

If no decision log exists and durable decisions begin accumulating, propose `docs/DECISIONS.md`; do not silently create it. Keep product decisions out of this workflow file.

## Success criterion

Build the intended product with minimal wasted reasoning and implementation. Optimize for **alignment → correctness → simplicity → quality → speed**, not volume of code.
