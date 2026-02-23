# Intro: First experience with AI (Chat GPT)

- **Dad Jokes:**
	- ChatGPT was the coolest thing; it was like a fever dream trying to figure out what it could do and test its limitations
	- Asked ChatGPT to write some original dad jokes.
	- Daughter: "Dad, these are terrible. They make no sense. Even your dad jokes are better than these." The bar was already pretty low, if I'm being honest.
- **Responding to a medical bill that looked incorrect:**
	- Provide concrete input (bill pdf + my own input)
	- Result: a very professional and effective response letter, but I won't say it saved me from actually paying the bill
- **Soon Realized:** 
	- AI was pretty bad when asked to act on it's own with no guardrails, especially for tasks that require creativity, human intuition, and taste
	- AI can be very effective when provided with good context, input, and guardrails
- **My goal:** 
	- Show how to provide good context, instructions, and guard rails when using AI coding agents like Copilot
	- Implement and test a new feature on an existing app using Copilot to understand and navigate the codebase, and to write good quality code
	- In the process, hopefully we can learn some techniques that might be helpful in your workflow and suggest some possible ways our teams can effectively implement AI
- **Disclaimer:**
	- AI tools and specifications change so fast and it's very hard to keep up
	- VS Code and Copilot features are changing all the time and there are lots of cool features I'm probably not aware of and I won't cover all the features in this demo
	- I am by no means an expert in using Copilot or coding agents, and I disclaim all liability for your use cases
## Problem: AI Output Is Inconsistent

- Copilot is powerful but generic
- Risk of drift and unintended edits
- We really need repeatable control
# Open Project and set chat to Ask Mode

> *Show me a list of all markdown files in this project with a brief description of each.* 

> *Visit this website and summarize the general AGENTS.md specification (not the AGENTS.md file in this project) in less than 300 words with succinct bullet points. attach: https://agents.md* 

- Entering the internet search prompt in Ask mode should cause Co-Pilot to complain that it doesn't have the ability to search the internet.
- Good opportunity to explain the different between **Ask mode vs Agent mode**. 

# AGENTS.md

## Set to Agent Mode

> *Visit this website and summarize the general AGENTS.md specification (not the AGENTS.md file in this project) in less than 300 words with succinct bullet points. attach: https://agents.md* 

- Open AGENTS.md
- Show first as Markdown file, then switch to preview mode. 

## Agent Instruction Precedence

1. User’s direct prompt — highest priority for that turn.
2. AGENTS.md from cwd
3. Global AGENTS.md in project root
4. Skills — applied when a skill is selected by user or matched by the agent
## Mention MCPs and Show Where to Find & Install

## Set to Ask Mode

> *Tell me about the AGENTS.md file in this project. How are we using it?* 

> *Briefly list the user-defined short cuts available to me.* 

- talk about the use of short cuts
- mention slash commands

> *Briefly list the user-defined skills available to me.* 

## Set to Agent Mode

> *Add two shortcuts to the # AGENTS.md file: one for writing tests and one for running tests. Reference their associated skills.*

> *onboard*

# Introduce the Accessibility Auditor app

- Quick app walkthrough showing the UI and current features
- Show the **MVP PRD** (Product Requirement Document)
- Briefly show the **MVP Implementation Plan**
- Mention the other PRDs and Plans
## Introduce the desired new feature: Audit History

- Why the feature would be helpful
- Show and discuss the **Audit History PRD**
	- PRD can and probably should be created by a human or team of humans
- **DO NOT go into detail yet**; just show and tell what it is
# Introduce skills

- Discuss **purpose**, **specification**, and **suggested structure**.
- Show our project skills in more detail, specifically **Plan from PRD**
## Create New Plan

1. Make sure you're in Agent mode and then prompt:
	> Create and switch to a new git branch called `feature-audit-history`
2. Use short cut `plan-to-prd` and attach `audit-history-prd.md`
3. Start the Plan Creation process
4. Return to Audit History PRD to show it more in depth
5. Show the new `audit-history-feature-plan.md` document

# Execute Plan

1. Use short cut `execute plan` and attach `audit-history-feature-plan.md`
2. Follow the prompts provided by the chat.
3. While the agent is executing the plan, go back the and **NOW go back** to `audit-history-prd.md` and **give a deeper tour** of what the PRD looks like. 
4. Return to the chat when first round of plan steps is completed
5. Switch VS Code to **Source Control to view the file Diffs**
6. Prompt the agent to continue to next plan section or batch of sections

## Write Tests and Run Tests

- Execute Plan will likely have created and run some new tests during execution
- Prompt the agent to describe the new tests
- If there is time, use `write-tests` and `run-tests` to identify, create, and run a couple of new tests

## Demo New Audit History Feature

## Wrap Up

**Left on its own, AI gives you really terrible dad jokes. But... put it inside a disciplined workflow, and now it can help ship real features.**
# Adoption Advice
 

If you want to experiment safely:  

1. Focus on writing accurate, detailed, and clearly scoped PRDs; they are the foundation of everything else

2. Start with one small, low-risk repo

3. Add a minimal `AGENTS.md`

4. Create 2–3 reusable prompt short cuts

5. Try the PRD → plan → execute workflow on a small feature

6. *Always* review diffs before merging!