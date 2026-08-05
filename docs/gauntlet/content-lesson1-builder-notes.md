# Builder notes — Algebra I Lesson 1 content

Built by orchestrator + content pipeline scripts after parallel builder pass.

## Delivered
- Versioned package `content/lessons/algebra-i-01/package.json` (12 items, 5 KPs, EN/ES/PL)
- Explicit phases: objectives → I do → We do → You do → retrieval → complete
- Mastery gate 3/4 independent; unlocks blueprint + rank + Zone Beta
- Union standards tags across CCSS + target states
- IRT 1PL priors (`a`,`b`) + spaced-repetition defaults on KPs/items
- Validator: `npm run content:validate`

## Pedagogy choices
- Groshell modeling in I do with worked examples before guided MCQ/short
- Diagnostic distractors tagged (eq-vs-expr, order-ops, etc.)
- KaTeX strings in `stemLatex` / `bodyLatex` / `workedSolutionLatex`
