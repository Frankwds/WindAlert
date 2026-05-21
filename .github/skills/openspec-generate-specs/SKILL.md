---
name: openspec-generate-specs
description: Generate or refine OpenSpec specifications for an existing project by analyzing implemented code, tests, documentation, issues, pull requests, and current openspec files. Use whenever the user wants to bootstrap OpenSpec in a brownfield codebase by documenting current behavior in separate capability specs.
---

# OpenSpec Specification Generator

Generate OpenSpec spec files that help developers understand and safely modify an existing system.

This skill works for any project domain, but it is only for current-state documentation in brownfield projects.

Its purpose is to bootstrap OpenSpec for a project that already exists by recording implemented behavior in separate specs.

It should remain useful for applications, APIs, libraries, internal tools, automation, and infrastructure-oriented repositories alike.

Do not use this skill for proposals, future design, or planned changes that are not yet implemented. If the user wants speculative design work, use a different workflow.

## Outcome

For each selected capability, produce or update `openspec/specs/<capability>/spec.md` with:

- A `Purpose` section
- At least one requirement with RFC 2119 language
- One or more scenarios that make the requirement concrete
- Enough operational and architectural context that a future developer can tell what the capability is responsible for, what must remain true, and where to start implementing or modifying it

## Quality Bar

Optimize for these qualities in every generated spec set:

- **Clarity over exhaustiveness.** Capture the behavior and constraints that matter for safe implementation, not every incidental detail.
- **Modular boundaries first.** Default to one spec per feature, slice, workflow, adapter, provider, or other unit that could reasonably be implemented, changed, added, or removed independently.
- **Behavior-shaped boundaries.** Each spec should describe one coherent capability that a developer can reason about without reconstructing the system from several thin documents, but do not collapse multiple independently changeable slices into one broad system-level spec.
- **Honest evidence handling.** Separate implemented behavior, inferred meaning, and open questions. Do not present a guessed rule as implemented unless the code or other supporting evidence justifies it.
- **Explicit invariants.** Call out shared rules, ownership boundaries, ordering constraints, state transitions, and failure expectations when they materially affect design or implementation.
- **Operational usefulness.** Include triggers, entry points, decision rules, persistence semantics, and runtime boundaries when they matter to future changes.
- **Shared layers only when necessary.** Create broader specs for foundations, runtime layers, or cross-cutting contracts only when they are important shared foundations and cannot be described cleanly inside a single modular feature spec.

## Workflow

1. **Confirm current-state scope**

   Confirm that the task is to document behavior the system already implements.

   This skill is only for current-state documentation. Use it to describe the system as it exists today, not to define future behavior.

   If the user mixes current-state documentation with proposed changes, ask them to narrow the scope to the implemented behavior that should be recorded now.

2. **Gather project context**

   Collect context broadly before going deep. Start with the sources that are most likely to describe the capability clearly.

   Read sources in this order when available:

   - Project guidance: `AGENTS.md`, `CONTRIBUTING.md`, `README.md`
   - Existing OpenSpec assets: `openspec/config.yaml`, `openspec/specs/`
   - User request, issue text, design notes, architecture docs, ADRs, `.feature` files, product docs
   - Main code paths and tests: `src/`, `app/`, `lib/`, `packages/`, `tests/`, or equivalent
   - Recent issues and pull requests, if tooling is available

   While reading, focus on decision-making surfaces:

   - entry points and interfaces
   - domain models and state transitions
   - business rules and validation
   - workflows, jobs, commands, handlers, and routes
   - data ownership and persistence boundaries
   - configuration, runtime behavior, startup, scheduling, and health surfaces
   - tests that define expected outcomes or edge cases

   During this pass, keep a lightweight inventory of candidate capabilities with:

   - capability name in progress
   - primary actor, caller, or trigger
   - primary observable outcome
   - whether it appears independently implementable, replaceable, or removable
   - key invariants or constraints
   - strongest evidence anchors
   - whether the candidate is strongly evidenced by code, tests, docs, or only partially evidenced

3. **Identify capability boundaries**

   Derive capability candidates from the system's actual behavior and current implementation boundaries, not from folder names or idealized architecture.

   Use kebab-case for capability names such as `workspace-indexing`, `order-cancellation`, `report-export`, or `theme-customization`.

   Use these decomposition lenses as needed:

   - Actor lens: who or what invokes the behavior
   - Workflow lens: what end-to-end outcome the system produces
   - Interface lens: API, command, event, page, protocol, or other interaction surface
   - Modularity lens: what could realistically be implemented, added, replaced, disabled, or removed without redesigning the whole system
   - Domain lifecycle lens: creation, approval, publication, reconciliation, archival, deletion, and similar transitions
   - Runtime lens: scheduling, background work, startup, orchestration, retries, health checks, or resilience behavior
   - Policy lens: validation, authorization, prioritization, quotas, deduplication, ownership, and other cross-cutting rules

   The final capability list may contain any number of specs, be that 5- or 50 specs. The number of specs is not a quality metric; use the system and its boundaries to decide how many specs to create, not a feeling of what a good number of specs looks like. Remember creating these specs will be delegated to a host of other agents in seperate forks, so creating any number of specs is achievable.

   Bias toward the smallest capability boundary that still produces a useful spec. If one broad candidate contains several slices that a team could implement or retire separately, split them.

   In particular, do not group multiple providers, integrations, adapters, backends, external systems, or strategy implementations into one capability when each has its own behavior, mapping, configuration, runtime contract, or test surface. Prefer one spec per such slice, plus a separate shared-layer spec only if a real shared contract needs to be preserved.

   Keep a candidate as its own capability when most of these are true:

   - it has a distinct trigger, actor, interface, or runtime boundary
   - it has a primary observable outcome that can be stated simply
   - it carries rules or constraints that are not merely incidental details of a larger flow
   - it could plausibly be implemented, modified, replaced, enabled, disabled, or removed with limited impact on adjacent slices
   - it can be implemented, tested, or changed with a mostly local understanding
   - a future maintainer could read this spec and know where to start

   Split a candidate when:

   - one document would bundle several providers, integrations, adapters, external systems, or strategy implementations that behave differently enough to be changed separately
   - one document would otherwise mix unrelated outcomes or actors
   - one part is a reusable policy or invariant that affects multiple workflows
   - the implementation already treats the slices independently
   - different slices have different configuration, mappings, state handling, persistence rules, external dependencies, or test anchors
   - a team could reasonably add, remove, or swap one slice without rewriting the others
   - the requirement list starts reading like a table of contents instead of one contract

   Merge adjacent candidates when:

   - they share the same trigger, outcome, and invariants
   - they are not realistically implemented or changed independently
   - splitting them would force developers to consult multiple thin specs to understand one real change
   - the current implementation still treats them as one coherent workflow

   Create broader system-layer or cross-cutting specs only when they describe infrastructure that multiple feature specs build on, such as shared orchestration, authorization policy, persistence conventions, event contracts, or runtime lifecycle rules.

   Avoid these anti-patterns:

   - naming capabilities after folders or layers instead of behavior
   - creating entity-only specs when the real behavior is broader than one data type
   - splitting conceptual sub-steps that are never triggered or reasoned about independently
   - collapsing several modular features into one spec just because they belong to the same subsystem
   - grouping multiple providers or integrations into a single spec when each one would merit its own implementation slice
   - writing separate specs for exceptions when a single rule would stay clearer and more accurate
   - letting a hoped-for architecture override the real system shape

   Example of preferred granularity:

   - prefer `holfuy-station-sync`, `metfrost-station-sync`, `portwind-station-sync`, and `windsmobi-station-sync`
   - only add a broader spec such as `weather-station-platform-contract` if there is a real shared contract or layer that those separate specs build upon

   Before writing any spec, prepare a candidate list with:

   - capability name
   - one-sentence purpose
   - why it is separate from adjacent candidates
   - primary trigger or entry point
   - primary observable outcome
   - why it is modular enough to deserve its own spec, or why it must remain a broader shared-layer spec
   - strongest evidence anchors

4. **Present the capability list and stop for user direction**

   After exploration, Reply with an enumerate list of specs followed by the "next step" section. For each one, include:

   - capability name
   - one-line purpose

   Next step: Give the user these choices: 
   (make sure they are not a part of the list of specs, but seperate)
   - Approve the list of specs and recieve guiding on creating them.
   - Provide the user with different directions and modifcations to apply to the list provided. Based on alternative slicings and organizations that the user may consider instead. Spend a second thinking here, before 
   - Finally ask the user "Anything else you would like to change or discuss?"

   Handle any custom answer or instruction given by the user, refining the list of specs, repeat until the user approves.
   If the user chooses to approve, respond with Step 2 below and do not start writing specs in the same reply.

   Step 2. Instruct the user to fork the conversation and handle one spec per fork. Tell the user to use this prompt in each fork:

   > "I want you to explore the codebase specifically and comprehensively in relation to this spec in the numbered list above. If you find an ambiguity that may materially affect the meaning, boundary, priority, or intent of the spec, and you cannot derive the answer from the codebase and project artifacts with enough confidence, ask me clarifying questions before you write the details for spec number: x"

   Also instruct the user how to fork effectively:

  > "Hot tip: To fork effectively, once the prompt above has been sent, click the "Fork conversation from this point" that appears above the latest prompt. Then just fork recursively until all specs are being processed in their own thread.

   Then tell the user to not use this thread for writing specific specs and that once all specs are written, they should return to this conversation and use this exact prompt for final verification:

   > "All of the specs has been written, i want you to look at the results, explore the codebase further and append, adjust, merge or delete specs to gain the best possible result. Or leave it as is, because it is good as is.
   > The specs purpose is to scaffold behaviour ahead of new changes, documenting important behaviour and giving an overview to future developers"

   Do not use a blocking question tool for capability confirmation in this skill. The enumerated list plus the three explicit user choices is the required handoff format.

5. **Write an individual spec file**

   In a fork for capability `<capability>`, create `openspec/specs/<capability>/spec.md` when needed and use this structure:

   ```md
   # <Capability Name>

   ## Purpose
   <Brief description of what this capability does, why it exists, and when it matters.>

   ## Requirements

   ### Requirement: <Requirement Name>
   The system SHALL/SHOULD/MAY ...

   #### Scenario: <Scenario Name>
   - **GIVEN** <precondition>
   - **WHEN** <action>
   - **THEN** <expected outcome>
   ```

   Follow this validator-friendly structure strictly:

   - keep exactly one top-level `# <Capability Name>` heading in the file
   - keep `## Purpose` and `## Requirements` as the only required level-2 sections unless you have strong evidence the validator accepts more for your environment
   - place explanatory operational context either in `Purpose` or directly inside the requirement prose unless and until you have verified that additional subheadings are accepted by the validator
   - make each `### Requirement: ...` a direct child of `## Requirements`
   - make each `#### Scenario: ...` a direct child of its requirement; do not insert extra headings between a requirement and its scenarios
   - when overwriting or merging, ensure you do not accidentally leave behind a second full spec body, a duplicate `## Requirements` section, or a second `# <Capability Name>` heading further down the file

   Every generated spec must include at least:

   - one `Purpose` section
   - one requirement
   - one scenario

   Prefer a few strong requirements over many shallow ones. Capture the rules that make the capability safe to build or modify.

6. **Write requirements from the right evidence**

   Anchor requirements primarily in code and tests, then refine them with design docs, issues, pull requests, and descriptive documentation when those sources help explain the implemented behavior.

   Use these rules:

   - use RFC 2119 keywords: `SHALL`, `SHOULD`, `MAY`
   - keep each requirement atomic
   - group related scenarios under the requirement they clarify or verify
   - capture triggers, decisions, constraints, state transitions, failure handling, and ownership boundaries when they matter
   - prefer explicit behavior over abstract slogans
   - ask clarifying questions when an ambiguity could materially change the meaning of a requirement, capability boundary, scenario outcome, or the reason the behavior exists, and the answer cannot be derived with enough confidence from the available evidence
   - call out assumptions or unresolved questions instead of silently inventing answers
   - when user clarification reveals important domain meaning, terminology, rationale, or non-obvious constraints, preserve that context in the spec itself, usually in `Purpose` and, when needed, in the relevant requirement wording or scenario setup
   - when helpful, reference the controlling code path, existing test, design note, or issue anchor
   - if a cross-cutting invariant affects several capabilities, either give it its own spec or preserve it consistently where it is consumed

   Do not turn reasonable guesses or desired future behavior into requirements. If the implementation does not support a claim strongly enough, either ask for clarification or record the uncertainty explicitly.

   When merging into an existing spec, preserve valid content and improve coherence only as needed.

7. **Validate each written spec and the final reconciled set**

   If an OpenSpec validator is available, run:

   ```bash
   openspec validate --specs --json
   ```

   If validation fails, fix the issues and re-run validation.

   If the validator is unavailable, verify manually that each written `spec.md` file has a `Purpose` section, at least one requirement, and at least one scenario. State clearly in the final summary that formal validation was skipped.

   After validation, do a manual quality pass:

   - Can a developer tell what this capability owns?
   - Can they identify the likely implementation starting point or change surface?
   - Are the critical invariants and decision rules obvious?
   - Does the spec boundary match how the work will actually be built or maintained?

   If not, refine the capability boundary or the wording before finishing.

8. **Involve the user**
    This steps aims at deriving high-value insights from the user that can sharpen or add to the spec.
    Ask the user for insights in relation to the capability in question in order to capture important context that may not be explicit in the codebase, but is important for future developers to understand when working with the capability.


9. **Show progress and final summary**

   During forked spec writing, confirm that each written file exists and give a brief progress update.

   During the final verification pass in the original conversation, review the full spec set together and append, adjust, merge, delete, or keep specs unchanged based on the evidence and the stated project goal.

   At the end of a writing or final verification pass, present a summary like this:

   ```text
   ## Specs Generated
   | Capability | Requirements | Scenarios | Status |
   |------------|-------------|-----------|--------|
   | <name>     | N           | M         | New/Merged/Overwritten |

   Total: X capabilities, Y requirements, Z scenarios
   Files written to openspec/specs/
   ```

## Source Priority

When sources conflict, prefer them in this order:

1. Actual code behavior
2. Test assertions
3. Design docs, ADRs, feature files, and accepted issues or pull requests
4. Descriptive docs such as `README.md` or `AGENTS.md`
5. Explicit user clarification about ambiguous meaning or terminology that cannot be derived confidently from the repository

Treat code and tests as the strongest authority. Use documentation and user clarification to explain or disambiguate implemented behavior, not to override it.

## Guardrails

### Discovering Specs

- Always enumerate the capability list and present the three explicit user choices before any spec-writing begins
- If the user approves the list, instruct them to fork the conversation and write one spec per fork instead of generating all specs in one thread

### Creating Specs

- When a clarification adds important context, capture that context in the resulting spec instead of leaving it implicit in the conversation
- Preserve existing spec content when merging unless the user explicitly wants replacement
- Use consistent formatting across generated spec files
- Keep capability directory names in kebab-case
- Make sure each spec has at least a `Purpose` section, one requirement, and one scenario

### General Guardrails

- Never fabricate implemented behavior
- Never present tentative design ideas or desired future behavior as derived current-state requirements
- When the user refers to `spec number: x`, resolve `x` only against the final numbered list shown to the user in that conversation, never against any internal candidate list, working notes, or reordered draft list
- If a material ambiguity affects meaning, intent, boundaries, or important terminology, ask for clarification instead of guessing
