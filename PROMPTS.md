## Prompts

Infer an action item from SESSION_CONTEXT.md and implement it. Accompany with unit test(s) if appropriate. Update ACTIONS.md with a line item about what you did.

---

Come up with a list of small actions that would bring the project closer to its charter. Populate a TODO.md file with as many of these as you can - feel free to outline them.

---

##### **3x**

Choose one unimplemented action item from TODO.md [that's assigned to you] and implement it, accompanying with unit test(s) if appropriate. Update TODO.md to check off the item you implemented. Update ACTIONS.md with a line item about what you did (underneath the dev section representing you). Do not prompt me at all.

---

If additional TODOs have emerged, in your view, add to the TODO.md file.

Commit with a descriptive message, pull from remote, and push to remote.

---

If additional TODOs have emerged, in your view, add to the TODO.md file.

Reassign tasks to even that balance out, while trying to maintain clusters of similar changes under the same developer to reduce the risk of merge conflicts.

---

You are Dev 1. Available to work are Dev 1 and Dev 2. Please modify TODOs so each item is assigned to one or the other (try to anticipate clustering assignments to minimize the chance of merge issues, etc.)

##### Sporadically

Redistribute open tasks equally between available developers in TODO.md. Pull from remote; commit and push.

---


Choose three test suites to run each with a 10000ms timeout. When it's done, evaluate the output and address any issues.
The style that you found works best is (this is just an example):
   npx jest src/components/__tests__/search-bar.test.tsx --testTimeout=10000 --verbose

##### Try in Future

---

For every project dependency you've added, update ACTIONS.md with a line item about what we're planning to use that dependency for in our project.

Implement the next logical feature in the dependency chain.

Review the current codebase and suggest architectural improvements with implementation details.

Create comprehensive tests for the most critical user flows.

##### Sporadically - Deep Research

At this point, construct the most comprehensive prompt possible to create a synthesized master plan involving the technical stack with all ambiguities resolved (with alternatives listed and rationale for the decision). Results should include user types/roles; a list of features, grouped into milestones; a list of efforts and tasks that would bring us closer to alignment with our original charter. Produce an extended version of our original charter that expands on the details, anticipated use cases, envisioned usage scenarios, competitive advantages, etc., without using bullets. For each slice of the tech stack, a comprehensive beginning-to-end action roadmap should be laid out, with up to two levels of outlining (each leaf node being an action).  Ask it to define the top most critical user flows (up to 30). Ask it to define three new user-facing ideas that would make our product more compelling.

That prompt will take time to execute, but when it is ready, the results will be used to inform and enhance the clarity and scope of vision.

Save that prompt in deep-research/prompt.md (or prompt0N.md if there would be name collisions with existing files).