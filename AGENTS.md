# Project rules

- Read `docs/GAME_FLOW.md` before gameplay changes.
- Reuse `data/*.json` and `public/assets/` instead of hardcoding duplicate story data.
- Do not invent novel facts.
- Ningyocho map = store/NPC exploration.
- Police station = clue and relationship deduction.
- Later locations = simple standalone scenes: background + Kaga avatar + NPC avatar + dialogue.
- Keep implementation simple.
- Follow `data/character-scope.json`: only V1 primary NPCs receive dedicated avatars, scenes, and relevant police-board nodes; keep secondary characters deferred unless explicitly promoted. Map future story content as location → primaryNpc → dialogue → clues → linkedLocations.
