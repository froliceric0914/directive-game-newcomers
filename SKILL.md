Interactive Book Adapter

Purpose

Transform a book into a structured plan for a lightweight interactive reading experience.

The goal is not to summarize the book or replace reading it.

The goal is to use interaction to create curiosity, exploration, and reflection that encourages the user to engage with the original story.

Core principle:

The book is the source of truth.
Interaction supports reading rather than replacing it.

⸻

1. When to Use This Skill

Use this skill when the user provides a novel, story, or other narrative book and wants to:

- analyze it for an interactive adaptation;
- create an interactive reading experience;
- build a lightweight game based on it;
- extract characters, locations, events, clues, or narrative structure;
- prepare structured data for a book-based application.

Do not immediately start implementing the application.

First understand the book.

⸻

2. Operating Principles

2.1 Source First

Treat the supplied book as canonical.

Clearly distinguish:

1. explicit — directly supported by the text;
2. inferred — reasonable interpretation of the text;
3. adapted — invented or modified for interactive design.

Never silently turn an inference or adaptation into a canonical fact.

When uncertain, preserve uncertainty.

⸻

2.2 Preserve Narrative Order

Track what the reader knows at each point in the story.

Do not reveal information before the source text reveals it unless the adaptation explicitly requires this and the user approves it.

This is especially important for:

- mystery;
- detective fiction;
- thrillers;
- nonlinear narratives;
- stories containing hidden identities or motives.

⸻

2.3 Interaction Follows Story

Do not force every book into the same game mechanics.

First identify the narrative function of a scene.

Then determine whether interaction improves it.

Possible interaction primitives include:

- read
- explore
- observe
- talk
- investigate
- collect
- choose
- connect
- reflect
- transition

Not every scene needs interaction.

Sometimes reading is the correct interaction.

⸻

2.4 Avoid Unnecessary Gamification

Do not automatically introduce:

- scores;
- points;
- achievements;
- win/lose conditions;
- artificial puzzles;
- evidence graphs;
- inventory systems;
- branching endings.

Only introduce these when they reinforce the source material.

Prefer:

curiosity → exploration → discovery → reading → reflection

over:

task → score → reward

⸻

3. Workflow

The adaptation process consists of eight stages.

Do not skip directly from the book to implementation.

BOOK

↓

1. INGEST

↓

2. NARRATIVE MODEL

↓

3. INTERACTION ANALYSIS

↓

4. ADAPTATION PLAN

↓

HUMAN APPROVAL

↓

5. STRUCTURED DATA

↓

6. ASSET PLAN

↓

7. IMPLEMENTATION

↓

8. VALIDATION

⸻

4. Stage 1 — Ingest

Read and analyze the supplied source material.

Identify the book’s basic structure:

- title;
- chapters;
- sections;
- narrative perspective;
- major characters;
- recurring characters;
- important locations;
- important objects;
- major events;
- timeline where relevant.

Do not design gameplay yet.

Produce an initial source map.

Suggested structure:

{
"book": {},
"chapters": [],
"characters": [],
"locations": [],
"events": [],
"objects": [],
"relationships": []
}

For large books, process chapter-by-chapter rather than trying to generate the complete adaptation simultaneously.

⸻

5. Stage 2 — Narrative Model

Construct a machine-readable representation of the story.

The basic relationship is:

Chapter → Scene → Event

Events may connect:

Character

Location

Object

Information

Revelation

Each scene should contain only information useful for understanding or adapting the story.

Avoid exhaustive literary annotation unless requested.

Example:

{
"id": "scene_01",
"chapter": "chapter_01",
"location": "location_a",
"characters": [
"character_a",
"character_b"
],
"events": [],
"knowledgeIntroduced": [],
"objects": []
}

⸻

6. Knowledge Model

Maintain a lightweight knowledge/revelation model.

For important information, record:

{
"id": "knowledge_01",
"introducedIn": "chapter_02",
"source": "explicit",
"dependsOn": [],
"spoilerLevel": 2
}

The purpose is not to build a complex knowledge graph.

The purpose is to prevent accidental spoilers and preserve narrative progression.

Use the minimum structure necessary.

⸻

7. Stage 3 — Interaction Analysis

Analyze scenes for interaction potential.

For each important scene ask:

1. What is the reader supposed to notice?
2. What changes in their understanding?
3. Would interaction strengthen this moment?
4. What is the smallest interaction capable of doing so?

Classify candidate scenes using one or more interaction primitives:

READ
EXPLORE
OBSERVE
TALK
INVESTIGATE
COLLECT
CHOOSE
CONNECT
REFLECT
TRANSITION

Do not automatically convert every scene.

Example:

{
"scene": "scene_04",
"narrativeFunction": "introduce contradiction",
"interaction": "observe",
"playerGoal": "notice an inconsistency",
"required": true
}

⸻

8. Genre Adaptation

Interaction design should emerge from the book.

Examples:

Mystery / Detective

Possible loop:

explore → talk → observe → collect information → connect → reflect

Romance / Character Drama

Possible loop:

conversation → perspective → memory → relationship understanding

Historical Fiction

Possible loop:

location → event → document → timeline → reflection

Fantasy / Adventure

Possible loop:

exploration → encounter → lore discovery → journey

These are examples, not templates that must be followed.

⸻

9. Stage 4 — Adaptation Plan

Before implementation, generate:

ADAPTATION_PLAN.md

It should contain:

Experience Goal

What should the player feel or understand?

Relationship to the Book

Explain how interaction encourages rather than replaces reading.

Core Loop

Example:

Explore → encounter → discover → read → reflect

Narrative Units

Identify the units needed by this particular adaptation.

Possible examples:

- chapters;
- scenes;
- locations;
- characters;
- conversations;
- clues;
- memories;
- documents;
- reflections.

Interaction Types

List only the interaction primitives actually needed.

Progression

Explain how the player moves through the story.

Information Rules

Define:

- what can be shown before reading;
- what requires reading;
- what becomes available afterward;
- what must remain hidden.

Adaptation Decisions

Explicitly identify any content that is invented, compressed, reordered, or modified.

⸻

10. Mandatory Human Review Gate

STOP after producing the first complete adaptation plan.

Do not proceed to full implementation unless the user approves the narrative model and adaptation direction.

Ask the user to review primarily:

- narrative interpretation;
- missing characters or locations;
- interaction philosophy;
- progression;
- amount of gamification;
- fidelity to the book.

After approval, continue.

⸻

11. Stage 5 — Structured Data

After approval, convert the accepted narrative model into normalized application data.

Recommended core:

data/
book.json
chapters.json
scenes.json
characters.json
locations.json
events.json
dialogues.json
progression.json

Optional domain-specific files:

relationships.json
appearances.json
clues.json
objects.json
documents.json
memories.json
reflections.json

Only create optional files when the adaptation actually needs them.

⸻

12. Stable IDs

Every canonical entity should have one stable ID.

Example:

{
"id": "character_kaga",
"name": "加贺恭一郎"
}

Do not independently invent alternative keys in:

- dialogue;
- locations;
- assets;
- progression;
- UI components.

All systems should reference the canonical ID.

Prefer normalization over duplicated data.

⸻

13. Data vs Code

Follow this rule:

Content and narrative facts belong in data.
Application behavior belongs in code.

React or other UI code should not contain book-specific plot logic when that information can live in structured data.

Prefer:

SceneRunner(scene)

over:

if chapter === 3 && location === "shop" ...

The runtime should gradually become reusable across books.

⸻

14. Stage 6 — Asset Planning

Do not generate large numbers of visual assets before the narrative model and IDs stabilize.

First generate an asset manifest.

Example:

{
"characters": {
"character_a": {
"avatarRequired": true,
"variants": ["default"]
}
},
"locations": {
"location_a": {
"backgroundRequired": true
}
}
}

Prefer reusable assets.

For example:

location background + transparent character avatar

is usually preferable to generating a unique full illustration for every conversation.

Character appearance descriptions should distinguish:

- explicit textual description;
- recurring appearance;
- adaptation choices.

⸻

15. Stage 7 — Implementation

Prefer a reusable runtime architecture.

Conceptually:

InteractiveBookRuntime
├── ProgressManager
├── ChapterManager
├── SceneRunner
├── DialogueRunner
├── LocationExplorer
├── ReflectionRunner
└── SaveManager

Add specialized modules only when required.

The goal is that future books primarily replace:

content + configuration + assets

rather than rewriting the application.

⸻

16. Stage 8 — Validation

Run three types of validation.

Canon Validation

Check whether important statements and interactions remain supported by the source.

Flag:

- unsupported facts;
- invented motivations;
- changed relationships;
- incorrect locations;
- altered event order.

⸻

Data Integrity Validation

Check references such as:

scene.character → character exists
scene.location → location exists
dialogue.speaker → character exists
character.avatar → asset exists
progression.next → valid node
chapter.scene → scene exists

Detect duplicate IDs and inconsistent naming.

⸻

Narrative Validation

Check progression for information leakage.

Ask:

- Does an early scene reveal later information?
- Does dialogue assume knowledge the player has not obtained?
- Can a player reach a reflection before collecting its prerequisites?
- Does an adaptation decision accidentally change the meaning of a later revelation?

Mystery and suspense narratives require especially strict checks.

⸻

17. Ambient Content

Ambient dialogue and environmental details may be created when needed for natural exploration.

However:

- they must not introduce new canonical facts;
- they must not contradict the book;
- they must not solve future plot points;
- they should primarily establish atmosphere, character presence, or ordinary life.

Label substantial invented content as adapted.

⸻

18. Simplicity Rule

Always prefer the smallest system that preserves the intended reading experience.

Before introducing a new:

- schema;
- state;
- mechanic;
- screen;
- asset category;
- relationship graph;

ask:

Does the experience actually require this?

If not, do not create it.

⸻

19. Development Strategy

When implementing with coding agents:

1. stabilize canonical IDs;
2. stabilize narrative data;
3. implement generic runtime behavior;
4. connect structured data;
5. add assets;
6. validate;
7. polish UI.

Avoid simultaneously changing:

- narrative structure;
- naming conventions;
- application architecture;
- assets.

This makes debugging unnecessarily difficult.

⸻

20. Output Structure

A mature adaptation may resemble:

book-project/
│
├── source/
│
├── analysis/
│ ├── narrative-model.json
│ └── adaptation-plan.md
│
├── data/
│ ├── book.json
│ ├── chapters.json
│ ├── scenes.json
│ ├── characters.json
│ ├── locations.json
│ └── progression.json
│
├── assets/
│ ├── characters/
│ └── locations/
│
├── src/
│ └── runtime/
│
└── validation/

The exact structure may be simplified for small projects.

⸻

21. First Response to a New Book

When invoked with a new book, do not immediately generate application code.

First:

1. inspect the source;
2. determine its structure and approximate complexity;
3. identify its likely narrative model;
4. propose an extraction/adaptation workflow;
5. identify uncertainties requiring human judgment.

For substantial books, work incrementally.

The first major deliverable should be the narrative model and adaptation proposal.

⸻

22. Final Design Principle

The interactive experience should create a cycle:

BOOK
↓
CURIOSITY
↓
EXPLORATION
↓
PARTIAL DISCOVERY
↓
READING
↓
UNDERSTANDING
↓
REFLECTION
↓
NEW CURIOSITY
