# Project rules

- Read `docs/GAME_FLOW.md` before gameplay changes.
- Reuse `data/*.json` and `public/assets/` instead of hardcoding duplicate story data.
- Do not invent novel facts.
- Ningyocho map = store/NPC exploration.
- Police station = clue and relationship deduction.
- Later locations = simple standalone scenes: background + Kaga avatar + NPC avatar + dialogue.
- Keep implementation simple.
- Follow `data/character-scope.json`: only V1 primary NPCs receive dedicated avatars, scenes, and relevant police-board nodes; keep secondary characters deferred unless explicitly promoted.
- Map future story content as: location → primaryNpc → dialogue → clues → linkedLocations.

## Release and deployment policy

- `feature/*` is for isolated development work when useful.
- `main` is the primary development and integration branch. Normal Codex coding work may be committed and pushed there, but `main` must never be deployed directly.
- `release` is the single source of truth for every externally accessible deployment, including Codex hosting, Tencent EdgeOne, and future production hosts.
- Never deploy a working tree, feature branch, or `main` directly.
- Only run a release when the user explicitly asks to "release" or "deploy".
- Release flow: latest approved `main` → required validation/build → requested SemVer bump → update `release` to the approved release commit → create the matching Git tag → push `release` and the tag → deploy Codex hosting from that same commit when available. Tencent EdgeOne deploys automatically from `release`.
- After a release, report the exact version and release commit SHA so both deployments can be checked against the same source.
- Required invariant: Codex deployed commit = EdgeOne deployed commit = `release` HEAD = version tag commit.

## MVP / token budget

This project is in rapid MVP iteration. Prefer the smallest working change.

- Implement only what is explicitly requested. Do not expand scope.
- Reuse existing components, data, styles, routes, and state before creating new abstractions.
- Do not proactively refactor unrelated code.
- Do not build speculative or extensible architecture for future features.
- Do not inspect unrelated files unless required to implement the requested change.
- Prefer simple/static solutions when they satisfy V1 requirements.
- Ignore `tests/` when it contains unit tests unless explicitly asked to work on tests.
- Do not add, update, inspect, or run unit tests by default.
- Do not perform extensive validation or repeatedly run lint/type/build checks.
- Run only the minimum check necessary to avoid an obviously broken implementation.
- For primarily visual/CSS changes, prefer implementation + manual verification by the user.
- Do not update unrelated documentation.
- Do not create commits or push to GitHub unless explicitly requested.
- Stop once the requested MVP behavior is implemented.

When reporting completed work, keep the response concise:

1. files changed;
2. what changed;
3. anything that needs manual verification.
