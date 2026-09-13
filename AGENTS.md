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
