# Handoff: Fortnite-Style Adaptive Math Mastery Game (Algebra I First)

**Project Codename (placeholder):** *Axiom Rising*  
**Target Platforms:** Primary web + console-quality (PS5/Xbox/PC feel), Fortnite-like accessibility.  
**Primary Audience:** High-school students preparing for PSAT / SAT / ACT / Classical Learning Test math sections + state Algebra I–II / Geometry / Trig courses.  
**Languages at launch:** English, Spanish, Polish (full UI + content + audio if applicable).  
**Math Rendering:** Strict KaTeX / LaTeX for all expressions, equations, graphs. No image-based math.

This document is the single source of truth for the LLM team. Use **Gauntlet Loops** (Matt Shumer style) for every major artifact: content, systems, UI, pedagogy validation. Do not accept “good enough.” Compare against concrete high bars and iterate until the critic passes.

---

## 1. Vision & North Star

Build a **AAA-feeling, Fortnite-mechanics-familiar, optimistic light-dystopian fantasy sci-fi** game whose core progression *is* mathematical mastery. Players experience the joy and power of rising through a stratified multi-planetary society by demonstrating genuine skill in algebra, geometry, trigonometry, and related topics.

The game must feel like Fortnite first (movement, building, third-person action, approachable controls, social/emote layer) and like the best adaptive tutor second. Pedagogy is non-negotiable and invisible in the best way: players advance because they actually know the material, not because they farmed XP.

**Success definition:** A talented 14-year-old who already knows some Algebra I can accelerate through content while still being forced through spaced retrieval and prerequisite mastery. A struggling student receives efficient, low-cognitive-load explicit instruction and cannot advance until mastery is demonstrated. Content is reusable across CA, NJ, MI, TX, NY, IL, MO, FL, WA, DC, OH, MN + Common Core without per-state reinvention.

---

## 2. Setting & Narrative Framework

**Tone:** Optimistic light dystopia. Hopeful, colorful, witty, epic, slightly absurd. Influences:

- *Red Rising*: Color/house stratification, rising through ranks via merit and will, planetary scale, rebellion-as-hope.
- *Fourth Wing*: Academy life, bonding with powerful companions, high-stakes training that feels like war preparation.
- *Valerian and the City of a Thousand Planets*: Dense, multi-species, visually spectacular urban/planetary hubs full of wonder.
- *The Hitchhiker’s Guide to the Galaxy*: Cosmic scale, dry humor, “Don’t Panic” guides, bureaucratic absurdity of the universe that still rewards cleverness.

**Core Premise (to be refined by narrative agents):**  
In the fractured but recovering Galactic Compact, mathematical fluency is the highest form of power. The great academies and orbital cities run on theorems, optimization, and precise modeling. Players begin as low-rank “Risers” or “Null-Candidates” in a vast multi-planetary academy-city complex. Mastery of algebraic structure, geometric reasoning, and trigonometric relationships unlocks better building tech, more powerful energy systems, companion constructs, travel permissions, and rank. Houses/factions compete and cooperate. Entropy, “Nulls,” and rival houses provide conflict that is solved or mitigated through correct mathematical application.

Keep the world *light*: violence is stylized, death is rare or reversible via “re-instantiation,” humor is present, and the dominant emotion is upward possibility.

Narrative should support seasonal content, house identity, and long-term player investment without requiring story completion for math progress.

---

## 3. Core Gameplay Loop & Familiar Mechanics

**Preserve Fortnite DNA:**

- Third-person camera and movement (sprint, jump, mantle, slide, build-edit feel).
- Building / construction as a first-class verb (structures, platforms, defenses, vehicles). Math mastery unlocks better blueprints, optimizes resource use, or enables advanced builds.
- Combat / conflict against AI or other players that can be influenced by mathematical correctness (e.g., correct modeling of trajectories, resource allocation, or “equation shields”).
- Inventory, loadouts, emotes, social features, seasonal battle-pass-like progression layered on top of *real* mastery progression.
- Approachable onboarding: controller + mouse/keyboard parity, clear tutorials that do not lecture about math before the player has agency.

**Primary Loop:**

1. Enter a district / mission / training range that has both free-play Fortnite-style activity and embedded math challenges.
2. Encounter an explicit teaching sequence or adaptive practice set (see Pedagogy).
3. Demonstrate mastery under the system’s criteria.
4. Unlock new abilities, blueprints, zones, ranks, or cosmetic rewards that feel powerful *because* the player earned them through understanding.
5. Spaced retrieval and interleaving pull previous skills back into new contexts.

Math is never a separate “minigame” bolted on. It is the language of the world’s technology and power.

---

## 4. Pedagogy Engine (Non-Negotiable)

The learning system must implement, in priority order:

### 4.1 Explicit Teaching (Zach Groshell style)
- Clear, concise modeling (“I do”).
- Guided practice with high response rate and immediate corrective feedback (“We do”).
- Independent practice only after success criteria are met (“You do”).
- Success criteria stated upfront.
- Worked examples and non-examples.
- Brisk pace, minimal extraneous load, high attention demands.
- “Just tell them” the necessary information; do not force discovery of core procedures when cognitive load would be better spent on application and transfer.

### 4.2 Knowledge Graph & Taxonomy (Justin Skycak / Math Academy influence)
- Atomic knowledge points / skills, not large topics.
- Explicit prerequisite graph.
- Encompassing / fractional implicit practice relations (doing higher skill gives partial credit / spaced practice to lower skills).
- Efficient sequencing that respects cognitive load and prerequisite readiness.
- The graph is the single source of truth for curriculum structure. Lessons are ordered views over the graph, not independent silos.

### 4.3 Cognitive Load Theory
- Manage intrinsic load by decomposing complex skills.
- Minimize extraneous load (clean UI during instruction, no competing animations or lore dumps while teaching).
- Maximize germane load (deliberate practice, variation, self-explanation prompts where useful).

### 4.4 Item Response Theory (IRT)
- Use for adaptive item selection and difficulty estimation (at minimum 1PL/Rasch; prefer 2PL where data allows).
- Track student ability θ and item parameters.
- Prefer items that maximize information at the student’s current ability while still serving spaced-repetition and interleaving goals.

### 4.5 Spaced Repetition + Mastery
- Mastery is demonstrated, not assumed. Students cannot advance past a knowledge point until performance criteria are met under retrieval conditions.
- Spaced retrieval of previously mastered material is mandatory and efficient (leverage encompassing relations).
- Interleaving of related skills is preferred over blocked practice once initial acquisition is solid.
- Review scheduling should be adaptive to individual forgetting curves, not fixed intervals.

### 4.6 Immediate Feedback
- Every response receives clear, specific, actionable feedback.
- Correct: brief confirmation + optional deeper insight or next challenge.
- Incorrect: identify the error type if possible, show the correct reasoning path, and schedule targeted follow-up.

Talented players advance faster through the graph but are still subject to the same mastery gates, spaced practice, and good retrieval practices. No “skip everything because high score.”

---

## 5. Content Architecture

- **Courses:** Algebra I (first), then Geometry, Algebra II, Trigonometry / Precalculus topics relevant to SAT/ACT/PSAT/CLT. 30–50 lessons per full course.
- **Lessons** are coherent instructional sequences (explicit teach + guided + independent + formative checks) that cover a cluster of knowledge points.
- **Knowledge Graph** sits underneath and is the durable asset. Lessons are the delivery vehicle.
- Content must be authored once and tagged for standards coverage so the same items serve multiple state views.

**Efficiency rule:** Design to the *union* of requirements across the listed states + Common Core. Where states differ in depth or endpoint (e.g., one requires facility with numbers up to 10, another to 15), implement the more demanding version and mark the extra as enrichment or optional extension. Never create parallel item banks per state.

---

## 6. Standards Alignment Strategy

Target states/jurisdictions: **CA, NJ, MI, TX, NY, IL, MO, FL, WA, DC, OH, MN** + **Common Core State Standards**.

- Maintain a canonical skill/knowledge-point inventory.
- Map every knowledge point and every item to the relevant standards codes from the listed jurisdictions.
- Student (or parent/teacher) can select a primary jurisdiction. Progress views then surface:
  - Overall course progress (graph coverage + lesson completion).
  - Progress against the selected jurisdiction’s standards (percentage of required standards with demonstrated mastery, list of remaining standards, evidence).
- The underlying content never changes with jurisdiction selection; only the progress reporting and recommended path emphasis change.
- Go slightly above the minimum of any single state when the cost is low and the benefit to transfer or future courses is high.

---

## 7. Progress Visualization

Players must be able to see, at any time:

1. Their position and remaining path through the current course (lesson list + knowledge-graph coverage heatmap or tree).
2. Mastery status per knowledge point (not yet introduced / in progress / mastered / due for review).
3. When a jurisdiction is selected: a clean standards dashboard showing which required standards are fully evidenced, partially evidenced, or missing, with links back to the supporting knowledge points and recent performance.

Visual language should feel native to the game world (rank insignia, house standing, theorem completeness, etc.) while remaining clear and non-gamified in a way that hides true mastery status.

---

## 8. Technical & Localization Requirements

- All mathematical content rendered with **KaTeX** (preferred) or equivalent high-quality LaTeX-to-web pipeline. Support for:
  - Inline and display math
  - Align environments, cases, matrices, piecewise
  - Graphs (desmos-like or custom interactive where pedagogically useful)
- Full localization for **English, Spanish, Polish**:
  - UI strings
  - Instructional text and feedback
  - Voice-over if present
  - Cultural/linguistic appropriateness of word problems (names, contexts) while preserving mathematical structure
- Accessibility: screen-reader friendly math, high-contrast options, input method flexibility.
- Data model must support IRT parameters, spaced-repetition state, encompassing credit, and multi-jurisdiction standard tags from day one.

---

## 9. Content Generation Pipeline (Required for Scale)

The team must deliver not only Algebra I Lesson 1 but a **repeatable pipeline** so additional lessons and entire courses can be produced efficiently by future LLM runs or human+LLM hybrid teams.

Pipeline stages (minimum):

1. **Curriculum Architect** – given course goals + knowledge graph constraints + standards, propose ordered list of lessons and the knowledge points each covers.
2. **Knowledge Point Spec** – atomic definition, prerequisites, success criteria, common misconceptions, example items at multiple difficulty levels.
3. **Lesson Designer** – explicit teach script, worked examples, guided practice sequence, independent set, formative checks, cognitive-load notes.
4. **Item Author** – generate, tag (standards, knowledge points, difficulty, IRT priors), and validate items. Include distractors that diagnose specific errors.
5. **Pedagogy Critic / Gauntlet** – separate agent reviews against explicit-teaching quality, cognitive load, mastery criteria, and Math Academy-style efficiency.
6. **Localization** – parallel Spanish and Polish versions with mathematical fidelity preserved.
7. **Integration** – package into the game’s content format with correct triggering conditions, feedback, and progress updates.

All generated content must be stored in a structured, versioned format (JSON or equivalent) that the game engine and adaptive system can consume directly.

---

## 10. First Deliverable: Algebra I – Lesson 1

**Title (working):** Variables, Expressions, and the Language of Algebra

**Core Knowledge Points (initial set – refine via graph work):**
- Understanding a variable as a symbol that represents a number or quantity that can change.
- Translating simple English phrases into algebraic expressions (and vice versa).
- Evaluating algebraic expressions for given values of the variable(s).
- Distinguishing expressions from equations.
- Basic order of operations in the presence of variables (as needed for evaluation).

**Pedagogical Sequence (explicit style):**
1. Clear objective and success criteria.
2. Concrete → pictorial → abstract modeling of variables.
3. Worked examples of translation and evaluation with think-aloud.
4. Guided practice with immediate feedback and error diagnosis.
5. Independent practice set with mastery gate.
6. Short retrieval / interleaving of any prerequisite arithmetic that surfaced as weak.
7. In-world application that feels like a Fortnite-style challenge or build constraint.

**Standards coverage:** Must map cleanly to the early Algebra I / “Building Blocks of Algebra” / “Relationships Between Quantities” / “Seeing Structure in Expressions” clusters across the target jurisdictions and Common Core. Prefer the more complete version of any overlapping requirement.

**Output of this deliverable must include:**
- Full lesson script and item set in structured format.
- Knowledge-point definitions and prerequisite links.
- Standard tags.
- English + Spanish + Polish versions.
- Integration notes for the game (how the lesson appears in the world, what unlocks on mastery).
- Gauntlet critic report showing it meets the pedagogical and quality bars.

---

## 11. Gauntlet Loop Instructions for the Team

For every significant artifact (lesson content, knowledge graph slice, adaptive algorithm stub, UI prototype of the progress view, combat-math integration concept, etc.):

1. **Lead agent** receives the goal + a concrete high-quality reference bar (examples: actual Math Academy lesson quality, Fortnite movement/feel videos or descriptions, Zach Groshell explicit-teaching exemplars, real state standard documents, high-production Valerian/Red Rising aesthetic references).
2. Lead decomposes into the smallest independently judgeable pieces.
3. Each piece is assigned a **Builder** agent and a separate **Critic** agent with fresh context.
4. Critic performs a side-by-side (or checklist + qualitative) comparison against the reference bar. Only pass if the new work meets or exceeds the bar on the dimensions that matter.
5. Failures return with the single largest gap identified. Builder iterates.
6. Loop until the critic passes or a human (or higher-level agent) decides the remaining gap is acceptable for the current stage.

Do not let the builder grade its own work. Do not accept “this is fine for an MVP.” The bar is AAA-feeling game + research-backed efficient mastery learning.

Priority Gauntlet targets for the first sprint:
- Algebra I Lesson 1 content + pedagogy fidelity.
- Knowledge-point and prerequisite model for the opening of Algebra I.
- Standards tagging schema that supports multi-state reporting without content duplication.
- Progress visualization concept that is both game-native and informationally clear.
- Pipeline skeleton that can ingest a new lesson request and emit structured, multi-language, tagged content.

---

## 12. Acceptance Criteria (First Milestone)

- [ ] Algebra I Lesson 1 exists in structured form, English/Spanish/Polish, with KaTeX math, explicit teaching sequence, mastery gate, and immediate feedback.
- [ ] Knowledge points for the lesson are defined, prerequisite-linked, and tagged to relevant standards from the target list + Common Core.
- [ ] A student selecting any of the listed jurisdictions sees accurate progress reporting against that jurisdiction’s expectations for the covered material.
- [ ] Adaptive / spaced / mastery logic is specified and at least stubbed so that talented students move faster while still receiving required retrieval practice.
- [ ] Content pipeline documentation + working example that demonstrates how Lesson 2 (and later courses) will be produced.
- [ ] All major pieces have passed at least one full Gauntlet Loop against the stated quality bars.
- [ ] Setting and mechanics remain recognizably Fortnite-like and approachable while serving the learning goals.

---

## 13. Assumptions & Open Decisions for the Team

- Working title and exact world name are open; propose 3–5 strong options consistent with the influences.
- Exact combat/building-math integration mechanics are open but must preserve Fortnite feel and not turn every fight into a worksheet.
- Exact IRT implementation details (1PL vs 2PL, Bayesian updating frequency, etc.) can start simple and harden with data.
- Voice acting / full audio localization can be phased; text + KaTeX must be complete at launch of Lesson 1.
- The knowledge graph for all of Algebra I does not need to be finished before Lesson 1 ships, but the slice for Lesson 1 and the pipeline to extend it must be solid.

---

**End of Handoff.**  

Execute with high agency. Prefer first-principles decisions that maximize long-term learning efficiency and player delight. When in doubt, choose the path that makes mastery unavoidable and the fantasy of rising through mathematical power feel real. 

The LLM team owns the detailed design and implementation from this point. Report progress against the acceptance criteria and surface any fundamental conflicts with the constraints above.