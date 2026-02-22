"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Presentation, PanelRightClose, PanelRightOpen } from "lucide-react";
import thisNotThatImage from "./this-not-that.png";

const TOTAL_SLIDES = 15;
const SLIDE_BASE_WIDTH = 1100;
const SLIDE_BASE_HEIGHT = 640;
const SLIDES_INDEX_KEY = "auditor-slides-index";
const SLIDE_TITLES: Record<number, string> = {
  1: "Title",
  2: "Intro: First AI Experience",
  3: "Problem: AI Is Inconsistent",
  4: "What We Need",
  5: "Live Demo · Ask Mode",
  6: "Ask Mode vs Agent Mode",
  7: "AGENTS.md",
  8: "Control Stack",
  9: "Live Demo · Shortcuts & Skills",
  10: "The App",
  11: "New Feature: Audit History",
  12: "Core Workflow",
  13: "Live Demo · Create the Plan",
  14: "Live Demo · Implement the Plan",
  15: "Wrap Up",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatDemoMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/`(.+?)`/g, "<em>$1</em>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderNoteText(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith(">")) {
    const quoteBody = trimmed.replace(/^>\s?/, "");
    return (
      <blockquote
        className="slides-notes-quote"
        dangerouslySetInnerHTML={{ __html: formatDemoMarkdown(quoteBody) }}
      />
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: formatDemoMarkdown(text) }} />;
}

const SLIDES_CHANNEL = "auditor-slides-sync";
const SLIDES_NOTES_OPEN_KEY = "auditor-slides-notes-open";

type SlideNotes = {
  section: string;
  lines: string[];
};

const SLIDE_NOTES: Record<number, SlideNotes> = {
  1: {
    section: "Internal Demo",
    lines: [
      "# Intro: First experience with AI (Chat GPT)",
      "- **My goal:**",
      "- Show how to provide good context, instructions, and guard rails when using AI coding agents like Copilot",
      "- Implement and test a new feature on an existing app using Copilot to understand and navigate the codebase, and to write good quality code",
      "- In the process, hopefully we can learn some techniques that might be helpful in your workflow and suggest some possible ways our teams can effectively implement AI into our coding workflows",
    ],
  },
  2: {
    section: "Intro: First AI Experience",
    lines: [
      "**Dad Jokes:** ChatGPT was the coolest thing; like a fever dream trying to figure out what it could do and test its limitations.",
      "Prompted it for original dad jokes.",
      "> *Daughter: \"Dad, these are terrible. They make no sense. Even your dad jokes are better than these.\"*",
      "**Responding to a medical bill that looked incorrect:** provided concrete input (bill PDF + my own input).",
      "Result: very professional and effective response letter (without overselling outcome).",
      "**Soon Realized:** AI was pretty bad when asked to act on it's own with no guardrails, especially for tasks that require creativity, human intuition, and taste",
      "**Soon Realized:** AI can be very effective when provided with good context, input, and guardrails",
      "**Disclaimer:** tools/specifications change fast; VS Code/Copilot features change constantly; this demo does not cover all features; I am not an expert.",
    ],
  },
  3: {
    section: "Problem: AI Is Inconsistent",
    lines: [
      "## Problem: AI Output Is Inconsistent",
      "Copilot is powerful but generic.",
      "Risk of drift and unintended edits.",
      "We really need repeatable control.",
    ],
  },
  4: {
    section: "What We Need",
    lines: [
      "Good context, concrete input, and clear instructions.",
      "Guardrails + repeatable workflow over ad-hoc prompting.",
      "Human review checkpoints built into the process.",
    ],
  },
  5: {
    section: "Live Demo · Ask Mode",
    lines: [
      "# Open Project and set chat to Ask Mode",
      "Open project and set chat to Ask Mode.",
      "Run prompt: list markdown files with brief descriptions.",
      "Run prompt that requires internet search.",
      "Expected outcome: Ask mode should complain it does not have ability to search the internet.",
      "Use this moment to explain Ask mode vs Agent mode.",
      "> *Show me a list of all markdown files in this project with a brief description of each.*",
      "> *Search the internet and summarize the general AGENTS.md specification (not the AGENTS.md file in this project) in less than 300 words with succinct bullet points.*",
      "- Entering the internet search prompt in Ask mode should cause Co-Pilot to complain that it doesn't have the ability to search the internet.",
      "- Good opportunity to explain the different between **Ask mode vs Agent mode**.",
    ],
  },
  6: {
    section: "Ask Mode vs Agent Mode",
    lines: [
      "Ask Mode: analysis/explanation, restricted capabilities.",
      "Agent Mode: execution with tools and repo actions.",
      "Same prompt produces different behavior depending on mode.",
      "Transition now to Agent mode for AGENTS.md internet prompt.",
    ],
  },
  7: {
    section: "AGENTS.md",
    lines: [
      "# AGENTS.md",
      "## Set to Agent Mode",
      "> *Search the internet and summarize the general AGENTS.md specification (not the AGENTS.md file in this project) in less than 300 words with succinct bullet points.*",
      "- Open AGENTS.md",
      "- Show first as Markdown file, then switch to preview mode.",
      "## Agent Instruction Precedence",
      "1) User’s direct prompt — highest priority for that turn.",
      "2) AGENTS.md from cwd.",
      "3) Global AGENTS.md in project root.",
      "4) Skills — applied when selected by user or matched by agent.",
      "5) Mention MCPs and Show Where to Find & Install",
    ],
  },
  8: {
    section: "Control Stack",
    lines: [
      "Prompt layer: reusable short cuts / slash commands.",
      "Capability layer: skills + MCP tools.",
      "Repo layer: AGENTS.md guardrails.",
      "Stacked control is what makes output repeatable.",
    ],
  },
  9: {
    section: "Live Demo · Shortcuts & Skills",
    lines: [
      "## Set to Ask Mode",
      "Set to Ask Mode.",
      "> *Tell me about the AGENTS.md file in this project. How are we using it?*",
      "> *Briefly list the user-defined short cuts available to me.*",
      "Call out short cuts and slash commands.",
      "> *Briefly list the user-defined skills available to me.*",
      "## Set to Agent Mode",
      "> *Add two shortcuts to AGENTS.md: one for writing tests and one for running tests. Reference their associated skills.*",
      "> *onboard*",
    ],
  },
  10: {
    section: "The App",
    lines: [
      "Introduce the Accessibility Auditor app.",
      "Quick app walkthrough showing current UI and features.",
      "Show the **MVP PRD** (Product Requirement Document).",
      "Briefly show the **MVP Implementation Plan**.",
      "Mention other PRDs and plans.",
    ],
  },
  11: {
    section: "New Feature: Audit History",
    lines: [
      "## Introduce the desired new feature: Audit History",
      "Introduce desired new feature: Audit History.",
      "Why feature would be helpful.",
      "Show and discuss the **Audit History PRD**.",
      "PRD can and probably should be created by a human or team of humans.",
      "DO NOT go into detail yet; just show and tell what it is.",
    ],
  },
  12: {
    section: "Core Workflow",
    lines: [
      "# Introduce skills",
      "Introduce skills: purpose, specification, suggested structure.",
      "Show project skills in more detail, especially Plan from PRD.",
      "## Create New Plan",
      "Workflow remains: PRD → Plan → Implement → Validate.",
    ],
  },
  13: {
    section: "Live Demo · Create the Plan",
    lines: [
      "1. Make sure you're in Agent mode and then prompt:",
      "> *Create and switch to a new git branch called feature-audit-history*",
      "2. Use short cut `plan-from-prd` and attach `audit-history-prd.md`",
      "3. Start the Plan Creation process",
      "4. Return to Audit History PRD to show it more in depth",
      "5. Show the new `audit-history-implementation-plan.md` document",
    ],
  },
  14: {
    section: "Live Demo · Implement the Plan",
    lines: [
      "# Implement Plan",
      "1. Use short cut `implement plan` and attach `audit-history-implementation-plan.md`",
      "2. Follow the prompts provided by the chat.",
      "3. While the agent is implementing the plan, **NOW go back** to `audit-history-prd.md` and **give a deeper tour** of what the PRD looks like.",
      "4. Return to the chat when first round of plan steps is completed",
      "5. Switch VS Code to **Source Control to view the file Diffs**",
      "6. Prompt the agent to continue to next plan section or batch of sections",
      "## Write Tests and Run Tests",
      "- Implement Plan will likely have created and run some new tests during implementation",
      "> *List and describe all tests available to us, and call out any new tests you created during this implementation.*",
      " To run tests: `npm test`",
      "- If there is time, use `write-tests` and `run-tests` to identify, create, and run a couple of new tests",
      "## Demo New Audit History Feature",
    ],
  },
  15: {
    section: "Wrap Up",
    lines: [
      "## Wrap Up",
      "**Left on its own, AI gives you really terrible dad jokes. But... put it inside a disciplined workflow, and now it can help ship real features.**",
      "# Adoption Advice",
      "If you want to experiment safely:",
      "1) Focus on writing accurate, detailed, clearly scoped PRDs.",
      "2) Start with one small, low-risk repo.",
      "3) Add a minimal AGENTS.md.",
      "4) Create 2–3 reusable prompt short cuts.",
      "5) Try PRD → plan → implement workflow on a small feature.",
      "6) *Always* review diffs before merging.",
    ],
  },
};

export default function SlidesPage() {
  const [index, setIndex] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [slideScale, setSlideScale] = useState(1);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const isBroadcastRef = useRef(false);
  const hasMountedRef = useRef(false);
  const stageRef = useRef<HTMLElement | null>(null);

  const readHashIndex = useCallback(() => {
    if (typeof window === "undefined") return null;
    const h = (window.location.hash || "").replace("#", "");
    const n = parseInt(h, 10);
    if (!Number.isFinite(n) || n < 1 || n > TOTAL_SLIDES) return null;
    return n - 1;
  }, []);

  const setActive = useCallback(
    (i: number, fromHash = false) => {
      const next = clamp(i, 0, TOTAL_SLIDES - 1);
      setIndex(next);
      if (typeof window !== "undefined") {
        if (!fromHash) {
          const target = `#${next + 1}`;
          if (window.location.hash !== target) {
            window.history.replaceState(null, "", target);
          }
        }
        sessionStorage.setItem(SLIDES_INDEX_KEY, String(next + 1));
        if (!isBroadcastRef.current && hasMountedRef.current && channelRef.current) {
          channelRef.current.postMessage({ slide: next + 1 });
        }
      }
    },
    []
  );

  const next = useCallback(() => setActive(index + 1), [index, setActive]);
  const prev = useCallback(() => setActive(index - 1), [index, setActive]);
  const first = useCallback(() => setActive(0), [setActive]);
  const last = useCallback(() => setActive(TOTAL_SLIDES - 1), [setActive]);

  useEffect(() => {
    const h = readHashIndex();
    if (h != null) {
      setActive(h, true);
    } else if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(SLIDES_INDEX_KEY);
      const n = saved ? parseInt(saved, 10) : NaN;
      const restored =
        Number.isFinite(n) && n >= 1 && n <= TOTAL_SLIDES ? n - 1 : 0;
      setActive(restored, false);
    } else {
      setActive(0, false);
    }
    hasMountedRef.current = true;
  }, [readHashIndex, setActive]);

  useEffect(() => {
    const onHashChange = () => {
      const h = readHashIndex();
      if (h != null) setActive(h, true);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [readHashIndex, setActive]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(SLIDES_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (e: MessageEvent) => {
      const slide = e.data?.slide;
      if (typeof slide === "number" && slide >= 1 && slide <= TOTAL_SLIDES) {
        isBroadcastRef.current = true;
        setActive(slide - 1, false);
        isBroadcastRef.current = false;
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [setActive]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(SLIDES_NOTES_OPEN_KEY);
    const presenterMode =
      new URLSearchParams(window.location.search).get("presenter") === "1";
    if (saved === "1" || saved === "0") {
      setIsNotesOpen(saved === "1");
      return;
    }
    setIsNotesOpen(presenterMode);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SLIDES_NOTES_OPEN_KEY, isNotesOpen ? "1" : "0");
  }, [isNotesOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stage = stageRef.current;
    if (!stage) return;

    const computeScale = () => {
      const rect = stage.getBoundingClientRect();
      const availableWidth = Math.max(0, rect.width - 44);
      const availableHeight = Math.max(0, rect.height - 56);
      const nextScale = Math.min(
        availableWidth / SLIDE_BASE_WIDTH,
        availableHeight / SLIDE_BASE_HEIGHT,
        1
      );
      setSlideScale(nextScale > 0 ? nextScale : 1);
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [isNotesOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (helpOpen && e.key !== "Escape") return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          first();
          break;
        case "End":
          e.preventDefault();
          last();
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen?.();
          break;
        case "?":
          e.preventDefault();
          setHelpOpen(true);
          break;
        case "n":
        case "N":
          e.preventDefault();
          setIsNotesOpen((prevOpen) => !prevOpen);
          break;
        case "Escape":
          if (helpOpen) setHelpOpen(false);
          else if (document.fullscreenElement) document.exitFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, next, prev, first, last]);

  const progressPct = ((index + 1) / TOTAL_SLIDES) * 100;
  const title = SLIDE_TITLES[index + 1] ?? `Slide ${index + 1}`;
  const notes = SLIDE_NOTES[index + 1];

  return (
    <div className="slides-deck" role="application" aria-label="Slide deck">
      <header>
        <div className="slides-brand" aria-label="Deck title">
          <span className="slides-dot" aria-hidden />
          <div className="slides-brand-title">
            AI Coding Agents: Chaos &lt; Control
          </div>
        </div>
        <div className="slides-progress-wrap" aria-label="Progress">
          <div className="slides-progress" aria-hidden>
            <span
              className="slides-progress-bar"
              style={{ width: `${progressPct.toFixed(4)}%` }}
            />
          </div>
          <div className="slides-counter" aria-live="polite">
            {index + 1} / {TOTAL_SLIDES}
          </div>
        </div>
        <div className="slides-nav" aria-label="Navigation">
          <button
            type="button"
            className="slides-btn"
            aria-label="Previous slide"
            onClick={prev}
            disabled={index === 0}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="slides-btn"
            aria-label="Next slide"
            onClick={next}
            disabled={index === TOTAL_SLIDES - 1}
          >
            Next →
          </button>
          <button
            type="button"
            className="slides-btn"
            aria-label={isNotesOpen ? "Hide speaker notes" : "Show speaker notes"}
            title={isNotesOpen ? "Hide speaker notes" : "Show speaker notes"}
            onClick={() => setIsNotesOpen((prevOpen) => !prevOpen)}
          >
            {isNotesOpen ? (
              <PanelRightClose className="size-4" aria-hidden />
            ) : (
              <PanelRightOpen className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </header>

      <div className={`slides-body ${isNotesOpen ? "notes-open" : ""}`}>
        <main
          ref={stageRef}
          className="slides-stage"
          tabIndex={-1}
          style={{ ["--slides-scale" as string]: String(slideScale) }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            if (x < 0.25) prev();
            else if (x > 0.75) next();
          }}
        >
          {/* Slide 1 — Title */}
          <section
            className={`slides-slide ${index === 0 ? "is-active" : ""}`}
            data-title="Title"
          >
            <div className="slides-eyebrow">Internal Demo</div>
            <h1>
              AI Coding Agents:
              <br />
              Chaos &lt; Control
            </h1>
            <p>
              How to make Copilot predictable in real projects with guardrails,
              reusable workflows, and disciplined review.
            </p>
            <div className="slides-pill-row" aria-label="Topics">
              <span className="slides-pill">AGENTS.md</span>
              <span className="slides-pill">Skills</span>
              <span className="slides-pill">PRD → Plan → Implement</span>
              <span className="slides-pill">Diff Review</span>
            </div>
          </section>

          {/* Slide 2 — Intro: First AI Experience */}
          <section
            className={`slides-slide ${index === 1 ? "is-active" : index === 0 ? "is-prev" : ""}`}
            data-title="Intro: First AI Experience"
          >
            <div className="slides-eyebrow">Intro: First AI Experience</div>
            <h2>My First AI Experiences</h2>
            <ul>
              <li>
                <strong>Dad jokes:</strong> confidently terrible — no taste, no
                creativity, no guardrails
              </li>
              <li>
                <strong>Medical bill:</strong> concrete input + clear goal →
                professional, effective result
              </li>
            </ul>
            <div className="slides-card" style={{ marginTop: 14 }}>
              <h3>Two lessons</h3>
              <ul>
                <li>AI without guardrails: confidently weird</li>
                <li>AI with context + constraints: genuinely useful</li>
              </ul>
            </div>
          </section>

          {/* Slide 3 — Problem: AI Is Inconsistent */}
          <section
            className={`slides-slide ${index === 2 ? "is-active" : index === 1 ? "is-prev" : ""}`}
            data-title="Problem: AI Is Inconsistent"
          >
            <div className="slides-eyebrow">Problem: AI Is Inconsistent</div>
            <h2>AI Output Is Inconsistent</h2>
            <ul>
              <li>Copilot is powerful but generic</li>
              <li>Risk of drift, unintended edits, and overreach</li>
              <li>Hard to trust without structure</li>
            </ul>
          </section>

          {/* Slide 4 — What We Need */}
          <section
            className={`slides-slide slides-repeatable-slide ${index === 3 ? "is-active" : index === 2 ? "is-prev" : ""}`}
            data-title="What We Need"
          >
            <div className="slides-eyebrow">What We Need</div>
            <h2>
              <span className="slides-highlight">Repeatable Control</span>
              {" > "}
              <span style={{ textDecoration: "line-through" }}>Better Prompting</span>
            </h2>
            <div className="slides-repeatable-layout">
              <div className="slides-repeatable-copy">
                <ul>
                  <li>Good context, clearly scoped</li>
                  <li>Structured instructions the agent must follow</li>
                  <li>A safe, repeatable workflow</li>
                  <li>Human review checkpoints</li>
                </ul>
              </div>
              <div className="slides-repeatable-visual" aria-label="Repeatable control visual">
                <div className="slides-repeatable-image-frame">
                  <Image
                    src={thisNotThatImage}
                    alt="This not that comparison illustrating repeatable control over ad-hoc prompting"
                    className="slides-repeatable-image"
                    fill
                    sizes="(max-width: 860px) 84vw, 48vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Slide 5 — Live Demo · Ask Mode */}
          <section
            className={`slides-slide ${index === 4 ? "is-active" : index === 3 ? "is-prev" : ""}`}
            data-title="Live Demo · Ask Mode"
          >
            <div className="slides-eyebrow">Live Demo · Ask Mode</div>
            <h2>Open Project + Ask Mode</h2>
            <p>
              Exploring what Copilot can — and can&rsquo;t — do in Ask mode.
            </p>
            <div className="slides-stack" role="list" aria-label="Prompts">
              <div className="slides-stack-item layer-prompt" role="listitem">
                <strong>Prompt 1</strong>
                <span>
                  Show me a list of all markdown files in this project with a
                  brief description of each
                </span>
              </div>
              <div className="slides-stack-item layer-cap" role="listitem">
                <strong>Prompt 2</strong>
                <span>
                  Use the internet to research the AGENTS.md specification in
                  less than 300 words
                </span>
              </div>
            </div>
          </section>

          {/* Slide 6 — Ask Mode vs Agent Mode */}
          <section
            className={`slides-slide ${index === 5 ? "is-active" : index === 4 ? "is-prev" : ""}`}
            data-title="Ask Mode vs Agent Mode"
          >
            <div className="slides-eyebrow">Ask Mode vs Agent Mode</div>
            <h2>Ask Mode vs Agent Mode</h2>
            <div className="slides-two-col">
              <div className="slides-card">
                <h3>Ask Mode</h3>
                <ul>
                  <li>Read and analyze code</li>
                  <li>Explain concepts</li>
                  <li>No file writes or tool calls</li>
                </ul>
              </div>
              <div className="slides-card">
                <h3>Agent Mode</h3>
                <ul>
                  <li>Executes multi-step work</li>
                  <li>Uses tools and workspace context</li>
                  <li>Applies repo guardrails</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Slide 7 — AGENTS.md */}
          <section
            className={`slides-slide ${index === 6 ? "is-active" : index === 5 ? "is-prev" : ""}`}
            data-title="AGENTS.md"
          >
            <div className="slides-eyebrow">AGENTS.md</div>
            <h2>AGENTS.md</h2>
            <ul>
              <li>
                Persistent, repo-level instructions loaded by any AI agent in the
                project
              </li>
              <li>
                Defines guardrails, shortcuts, skill references, and workflow rules
              </li>
            </ul>
            <div className="slides-card" style={{ marginTop: 14 }}>
              <h3>Instruction precedence</h3>
              <ul>
                <li>User&rsquo;s direct prompt — highest priority for that turn</li>
                <li>AGENTS.md from current working directory</li>
                <li>Global AGENTS.md in project root</li>
                <li>Skills — applied when selected or matched</li>
              </ul>
            </div>
          </section>

          {/* Slide 8 — Control Stack */}
          <section
            className={`slides-slide ${index === 7 ? "is-active" : index === 6 ? "is-prev" : ""}`}
            data-title="Control Stack"
          >
            <div className="slides-eyebrow">Control Stack</div>
            <h2>Three Layers of Agent Control</h2>
            <p>Shift from prompting → controlling.</p>
            <div className="slides-stack" role="list" aria-label="Control stack layers">
              <div className="slides-stack-item layer-prompt" role="listitem">
                <strong>Prompt Layer</strong>
                <span>Shortcuts / repeatable prompt commands</span>
              </div>
              <div className="slides-stack-item layer-cap" role="listitem">
                <strong>Capability Layer</strong>
                <span>Skills + MCP tools</span>
              </div>
              <div className="slides-stack-item layer-repo" role="listitem">
                <strong>Repo Layer</strong>
                <span>AGENTS.md — rules, guardrails, project context</span>
              </div>
            </div>
          </section>

          {/* Slide 9 — Live Demo · Shortcuts & Skills */}
          <section
            className={`slides-slide ${index === 8 ? "is-active" : index === 7 ? "is-prev" : ""}`}
            data-title="Live Demo · Shortcuts & Skills"
          >
            <div className="slides-eyebrow">Live Demo · Shortcuts &amp; Skills</div>
            <h2>Shortcuts + Skills + MCP</h2>
            <div className="slides-flow" aria-label="Demo steps">
              <div className="slides-step">
                <div className="n">A</div>
                <div className="t">List shortcuts</div>
                <div className="d">See what reusable prompts are available</div>
              </div>
              <div className="slides-step">
                <div className="n">B</div>
                <div className="t">List skills</div>
                <div className="d">See structured, multi-step capabilities</div>
              </div>
              <div className="slides-step">
                <div className="n">C</div>
                <div className="t">Add shortcuts</div>
                <div className="d">
                  Agent adds write-tests + run-tests to AGENTS.md
                </div>
              </div>
              <div className="slides-step">
                <div className="n">D</div>
                <div className="t">onboard</div>
                <div className="d">Agent orients itself in the codebase</div>
              </div>
            </div>
          </section>

          {/* Slide 10 — The App */}
          <section
            className={`slides-slide ${index === 9 ? "is-active" : index === 8 ? "is-prev" : ""}`}
            data-title="The App"
          >
            <div className="slides-eyebrow">The App</div>
            <h2>Accessibility URL Auditor</h2>
            <ul>
              <li>
                Runs deterministic accessibility checks on any public URL
              </li>
              <li>Returns a pass/warn/fail report with actionable findings</li>
              <li>
                MVP built end-to-end using this exact workflow: PRDs → plans →
                agent execution
              </li>
            </ul>
            <div className="slides-pill-row">
              <span className="slides-pill">MVP PRD</span>
              <span className="slides-pill">MVP Plan</span>
              <span className="slides-pill">Tests</span>
              <span className="slides-pill">Live Demo Target</span>
            </div>
          </section>

          {/* Slide 11 — New Feature: Audit History */}
          <section
            className={`slides-slide ${index === 10 ? "is-active" : index === 9 ? "is-prev" : ""}`}
            data-title="New Feature: Audit History"
          >
            <div className="slides-eyebrow">New Feature: Audit History</div>
            <h2>New Feature: Audit History</h2>
            <ul>
              <li>Persist every successful audit to a local SQLite database</li>
              <li>View past results grouped by URL</li>
              <li>Re-run known URLs with one click</li>
            </ul>
            <div className="slides-card" style={{ marginTop: 14 }}>
              <h3>How we drive it</h3>
              <ul>
                <li>
                  Requirements are human-owned — a PRD written before any code
                  is touched
                </li>
                <li>Agent executes; it does not design or scope</li>
              </ul>
            </div>
          </section>

          {/* Slide 12 — Core Workflow */}
          <section
            className={`slides-slide ${index === 11 ? "is-active" : index === 10 ? "is-prev" : ""}`}
            data-title="Core Workflow"
          >
            <div className="slides-eyebrow">Core Workflow</div>
            <h2>PRD → Plan → Implement</h2>
            <p>Make the work legible, scoped, and reviewable.</p>
            <div className="slides-flow" aria-label="Workflow steps">
              <div className="slides-step">
                <div className="n">01</div>
                <div className="t">PRD</div>
                <div className="d">
                  Human-owned requirements and acceptance criteria
                </div>
              </div>
              <div className="slides-step">
                <div className="n">02</div>
                <div className="t">Plan</div>
                <div className="d">
                  Agent generates stepwise tasks with checkboxes
                </div>
              </div>
              <div className="slides-step">
                <div className="n">03</div>
                <div className="t">Implement</div>
                <div className="d">Execute in batches; pause for review</div>
              </div>
              <div className="slides-step">
                <div className="n">04</div>
                <div className="t">Validate</div>
                <div className="d">
                  Run tests, review diffs, iterate safely
                </div>
              </div>
            </div>
          </section>

          {/* Slide 13 — Live Demo · Create the Plan */}
          <section
            className={`slides-slide ${index === 12 ? "is-active" : index === 11 ? "is-prev" : ""}`}
            data-title="Live Demo · Create the Plan"
          >
            <div className="slides-eyebrow">Live Demo · Create the Plan</div>
            <h2>plan from prd</h2>
            <div className="slides-flow" aria-label="Demo steps">
              <div className="slides-step">
                <div className="n">01</div>
                <div className="t">New branch</div>
                <div className="d">
                  Agent creates + switches to feature-audit-history
                </div>
              </div>
              <div className="slides-step">
                <div className="n">02</div>
                <div className="t">plan from prd</div>
                <div className="d">
                  Attach Audit History PRD → agent generates the plan
                </div>
              </div>
              <div className="slides-step">
                <div className="n">03</div>
                <div className="t">Review PRD</div>
                <div className="d">
                  Deep tour of the Audit History PRD
                </div>
              </div>
              <div className="slides-step">
                <div className="n">04</div>
                <div className="t">Review plan</div>
                <div className="d">
                  Inspect the generated implementation plan
                </div>
              </div>
            </div>
          </section>

          {/* Slide 14 — Live Demo · Implement the Plan */}
          <section
            className={`slides-slide ${index === 13 ? "is-active" : index === 12 ? "is-prev" : ""}`}
            data-title="Live Demo · Implement the Plan"
          >
            <div className="slides-eyebrow">Live Demo · Implement the Plan</div>
            <h2>implement plan</h2>
            <div className="slides-flow" aria-label="Demo steps">
              <div className="slides-step">
                <div className="n">01</div>
                <div className="t">implement plan</div>
                <div className="d">
                  Attach the plan → agent executes in sections
                </div>
              </div>
              <div className="slides-step">
                <div className="n">02</div>
                <div className="t">Review diffs</div>
                <div className="d">
                  Source Control → inspect every change before continuing
                </div>
              </div>
              <div className="slides-step">
                <div className="n">03</div>
                <div className="t">Tests</div>
                <div className="d">
                  write-tests + run-tests to validate behavior
                </div>
              </div>
              <div className="slides-step">
                <div className="n">04</div>
                <div className="t">Check out the New Feature</div>
                <div className="d">
                  Show the live Audit History feature in the running app
                </div>
              </div>
            </div>
          </section>

          {/* Slide 15 — Wrap Up */}
          <section
            className={`slides-slide ${index === 14 ? "is-active" : index === 13 ? "is-prev" : ""}`}
            data-title="Wrap Up"
          >
            <div className="slides-eyebrow">Wrap Up</div>
            <h2>Key Takeaway</h2>
            <p>
              Left on its own, AI gives you really terrible dad jokes.
              <br />
              But... inside a disciplined workflow, it can help ship real
              features.
            </p>
            <div className="slides-card" style={{ marginTop: 16 }}>
              <h3>Adoption Playbook</h3>
              <ul>
                <li>Write accurate, clearly scoped PRDs</li>
                <li>Start with one small, low-risk repo</li>
                <li>
                  Add a minimal{" "}
                  <span className="slides-highlight">AGENTS.md</span>
                </li>
                <li>Create 2–3 reusable shortcuts</li>
                <li>Try PRD → plan → implement on a small feature</li>
                <li>
                  <strong>Always</strong> review diffs before merging
                </li>
              </ul>
            </div>
          </section>
        </main>

        {isNotesOpen && (
          <aside className="slides-notes" aria-label="Speaker notes panel">
            <div className="slides-notes-header">
              <div className="slides-notes-eyebrow">Speaker Notes</div>
              <h3>{notes.section}</h3>
              <p>
                Slide {index + 1} of {TOTAL_SLIDES}: {title}
              </p>
            </div>

            <div className="slides-notes-stream slides-notes-block">
              <ul>
                {notes.lines.map((line, lineIndex) => (
                  <li key={`line-${index}-${lineIndex}`}>{renderNoteText(line)}</li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      <footer className="slides-footer">
        <div className="slides-help" aria-label="Keyboard shortcuts">
          <span className="slides-kbd">← / →</span>
          <span className="slides-kbd">Space</span>
          <span className="slides-kbd">Home / End</span>
          <span className="slides-kbd">F</span>
          <span className="slides-kbd">?</span>
          <span className="slides-kbd">Esc</span>
        </div>
        <div className="slides-footer-title" aria-label="Current slide title">
          {title}
        </div>
      </footer>

      <Link
        href="/"
        className="slides-corner-link"
        aria-label="Back to Accessibility Auditor"
        onClick={() =>
          sessionStorage.setItem(SLIDES_INDEX_KEY, String(index + 1))
        }
      >
        <Presentation className="slides-corner-icon" aria-hidden />
      </Link>

      {helpOpen && (
        <dialog
          open
          className="slides-dialog"
          style={{
            position: "fixed",
            inset: "auto",
            margin: "auto",
            maxWidth: "90vw",
          }}
          onCancel={() => setHelpOpen(false)}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>Controls</div>
            <button
              type="button"
              className="slides-btn"
              onClick={() => setHelpOpen(false)}
            >
              Close
            </button>
          </div>
          <ul>
            <li>
              <span className="slides-highlight">Next</span>: Right Arrow / Space /
              PageDown
            </li>
            <li>
              <span className="slides-highlight">Previous</span>: Left Arrow /
              PageUp
            </li>
            <li>
              <span className="slides-highlight">First / Last</span>: Home / End
            </li>
            <li>
              <span className="slides-highlight">Fullscreen</span>: F
            </li>
            <li>
              <span className="slides-highlight">Help</span>: ?
            </li>
            <li>
              <span className="slides-highlight">Exit fullscreen / Close help</span>
              : Esc
            </li>
            <li>
              URL hash updates (e.g. <span style={{ fontFamily: "var(--slides-mono)" }}>#3</span>)
              so you can deep-link a slide.
            </li>
          </ul>
        </dialog>
      )}
    </div>
  );
}
