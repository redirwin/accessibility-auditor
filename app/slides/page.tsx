"use client";

import { useState, useEffect, useCallback } from "react";

const TOTAL_SLIDES = 15;
const SLIDE_TITLES: Record<number, string> = {
  1: "Title",
  2: "First AI experience",
  3: "Problem",
  4: "Need: repeatable control",
  5: "Control stack",
  6: "Repo layer: AGENTS.md",
  7: "Capability layer: Skills + MCP",
  8: "Demo goals",
  9: "The app",
  10: "New feature",
  11: "Ask vs Agent mode",
  12: "How we guide the agent",
  13: "PRD to plan to implement",
  14: "Review diffs",
  15: "Wrap + adoption",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SlidesPage() {
  const [index, setIndex] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

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
      if (!fromHash && typeof window !== "undefined") {
        const target = `#${next + 1}`;
        if (window.location.hash !== target) {
          window.history.replaceState(null, "", target);
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
    setActive(h ?? 0, h != null);
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

  return (
    <div className="slides-deck" role="application" aria-label="Slide deck">
      <header>
        <div className="slides-brand" aria-label="Deck title">
          <span className="slides-dot" aria-hidden />
          <div className="slides-brand-title">
            AI Coding Agents: From Chaos to Control
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
        </div>
      </header>

      <main
        className="slides-stage"
        tabIndex={-1}
        onClick={(e) => {
          const x = e.clientX / window.innerWidth;
          if (x < 0.25) prev();
          else if (x > 0.75) next();
        }}
      >
        {/* Slide 1 */}
        <section
          className={`slides-slide ${index === 0 ? "is-active" : ""}`}
          data-title="Title"
        >
          <div className="slides-eyebrow">Internal Demo</div>
          <h1>
            AI Coding Agents:
            <br />
            From Chaos to Control
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

        {/* Slide 2 */}
        <section
          className={`slides-slide ${index === 1 ? "is-active" : index === 0 ? "is-prev" : ""}`}
          data-title="First AI experience"
        >
          <div className="slides-eyebrow">Hook</div>
          <h2>My First AI Experience</h2>
          <p>
            I asked ChatGPT to write original dad jokes. My daughter said:
            &ldquo;Dad, these are terrible. Even your dad jokes are better.&rdquo;
          </p>
          <ul>
            <li>Early lesson: AI without guardrails can be confidently weird.</li>
            <li>But with context + constraints, it can be genuinely useful.</li>
          </ul>
        </section>

        {/* Slide 3 */}
        <section
          className={`slides-slide ${index === 2 ? "is-active" : index === 1 ? "is-prev" : ""}`}
          data-title="Problem"
        >
          <div className="slides-eyebrow">Why this matters</div>
          <h2>AI Output Is Inconsistent</h2>
          <ul>
            <li>Copilot is powerful but generic.</li>
            <li>Risk of drift, unintended edits, and overreach.</li>
            <li>Hard to trust without structure.</li>
          </ul>
        </section>

        {/* Slide 4 */}
        <section
          className={`slides-slide ${index === 3 ? "is-active" : index === 2 ? "is-prev" : ""}`}
          data-title="Need: repeatable control"
        >
          <div className="slides-eyebrow">Thesis</div>
          <h2>What Teams Actually Need</h2>
          <p>
            <span className="slides-highlight">Repeatable control</span> — not
            better prompting.
          </p>
          <ul>
            <li>Clear context</li>
            <li>Structured instructions</li>
            <li>Safe workflow</li>
            <li>Human review checkpoints</li>
          </ul>
        </section>

        {/* Slide 5 */}
        <section
          className={`slides-slide ${index === 4 ? "is-active" : index === 3 ? "is-prev" : ""}`}
          data-title="Control stack"
        >
          <div className="slides-eyebrow">Mental model</div>
          <h2>Control Stack for AI Agents</h2>
          <p>Shift from prompting → controlling.</p>
          <div className="slides-stack" role="list" aria-label="Control stack layers">
            <div className="slides-stack-item layer-prompt" role="listitem">
              <strong>Prompt Layer</strong>
              <span>Shortcuts / repeatable prompts</span>
            </div>
            <div className="slides-stack-item layer-cap" role="listitem">
              <strong>Capability Layer</strong>
              <span>Skills + MCP tools</span>
            </div>
            <div className="slides-stack-item layer-repo" role="listitem">
              <strong>Repo Layer</strong>
              <span>AGENTS.md rules</span>
            </div>
          </div>
        </section>

        {/* Slide 6 */}
        <section
          className={`slides-slide ${index === 5 ? "is-active" : index === 4 ? "is-prev" : ""}`}
          data-title="Repo layer: AGENTS.md"
        >
          <div className="slides-eyebrow">Repo layer</div>
          <h2>AGENTS.md</h2>
          <ul>
            <li>Persistent repo instructions for the agent.</li>
            <li>Defines guardrails and expectations.</li>
            <li>Helps keep changes aligned with project standards.</li>
          </ul>
          <div className="slides-card" style={{ marginTop: 14 }}>
            <h3>Instruction precedence (conceptual)</h3>
            <ul>
              <li>User prompt (for that turn)</li>
              <li>Nearest AGENTS.md</li>
              <li>Project root AGENTS.md</li>
              <li>Skills (when selected / matched)</li>
            </ul>
          </div>
        </section>

        {/* Slide 7 */}
        <section
          className={`slides-slide ${index === 6 ? "is-active" : index === 5 ? "is-prev" : ""}`}
          data-title="Capability layer: Skills + MCP"
        >
          <div className="slides-eyebrow">Capability layer</div>
          <h2>Skills + MCP</h2>
          <ul>
            <li>
              <strong>Skills</strong>: reusable, structured capabilities for
              multi-step work.
            </li>
            <li>
              <strong>MCP</strong>: standardized way agents access external
              tools/data.
            </li>
            <li>Goal: predictable execution, not &ldquo;magic&rdquo;.</li>
          </ul>
        </section>

        {/* Slide 8 */}
        <section
          className={`slides-slide ${index === 7 ? "is-active" : index === 6 ? "is-prev" : ""}`}
          data-title="Demo goals"
        >
          <div className="slides-eyebrow">Live demo</div>
          <h2>Today&rsquo;s Demo</h2>
          <p>Ship a real feature using Copilot — safely.</p>
          <div className="slides-flow" aria-label="Demo steps">
            <div className="slides-step">
              <div className="n">01</div>
              <div className="t">Understand</div>
              <div className="d">Orient in the codebase with guardrails.</div>
            </div>
            <div className="slides-step">
              <div className="n">02</div>
              <div className="t">Plan</div>
              <div className="d">Generate an implementation plan from a PRD.</div>
            </div>
            <div className="slides-step">
              <div className="n">03</div>
              <div className="t">Implement</div>
              <div className="d">Execute in batches; stay scoped, avoid drift.</div>
            </div>
            <div className="slides-step">
              <div className="n">04</div>
              <div className="t">Validate</div>
              <div className="d">Run tests + review diffs before merging.</div>
            </div>
          </div>
        </section>

        {/* Slide 9 */}
        <section
          className={`slides-slide ${index === 8 ? "is-active" : index === 7 ? "is-prev" : ""}`}
          data-title="The app"
        >
          <div className="slides-eyebrow">Context</div>
          <h2>Accessibility URL Auditor (MVP)</h2>
          <ul>
            <li>Existing working app with a documented workflow.</li>
            <li>Built using PRDs + implementation plans.</li>
            <li>Great candidate for a &ldquo;real feature&rdquo; demo.</li>
          </ul>
          <div className="slides-pill-row">
            <span className="slides-pill">MVP PRD</span>
            <span className="slides-pill">MVP Plan</span>
            <span className="slides-pill">Diff review</span>
          </div>
        </section>

        {/* Slide 10 */}
        <section
          className={`slides-slide ${index === 9 ? "is-active" : index === 8 ? "is-prev" : ""}`}
          data-title="New feature"
        >
          <div className="slides-eyebrow">Goal</div>
          <h2>New Feature: Audit History</h2>
          <ul>
            <li>Store past audits</li>
            <li>View and compare historical results</li>
            <li>Improve practical usefulness for real workflows</li>
          </ul>
          <p style={{ marginTop: 10 }}>
            We&rsquo;ll keep requirements human-owned (PRD), and let the agent
            help execute.
          </p>
        </section>

        {/* Slide 11 */}
        <section
          className={`slides-slide ${index === 10 ? "is-active" : index === 9 ? "is-prev" : ""}`}
          data-title="Ask vs Agent mode"
        >
          <div className="slides-eyebrow">Demo anchor</div>
          <h2>Ask Mode vs Agent Mode</h2>
          <div className="slides-two-col">
            <div className="slides-card">
              <h3>Ask Mode</h3>
              <ul>
                <li>Read/analyze code</li>
                <li>Explain concepts</li>
                <li>Limited actions</li>
              </ul>
            </div>
            <div className="slides-card">
              <h3>Agent Mode</h3>
              <ul>
                <li>Executes multi-step work</li>
                <li>Uses tools/workspace context</li>
                <li>Applies repo guardrails</li>
              </ul>
            </div>
          </div>
          <p style={{ marginTop: 12 }}>
            Teaching moment: try an internet request in Ask Mode → it should
            refuse.
          </p>
        </section>

        {/* Slide 12 */}
        <section
          className={`slides-slide ${index === 11 ? "is-active" : index === 10 ? "is-prev" : ""}`}
          data-title="How we guide the agent"
        >
          <div className="slides-eyebrow">Demo anchor</div>
          <h2>How We Guide the Agent</h2>
          <div className="slides-flow" aria-label="Guidance mechanisms">
            <div className="slides-step">
              <div className="n">A</div>
              <div className="t">AGENTS.md</div>
              <div className="d">
                Persistent rules and expectations in the repo.
              </div>
            </div>
            <div className="slides-step">
              <div className="n">B</div>
              <div className="t">Shortcuts</div>
              <div className="d">
                Reusable prompts (slash commands) for repeatability.
              </div>
            </div>
            <div className="slides-step">
              <div className="n">C</div>
              <div className="t">Skills</div>
              <div className="d">
                Structured capabilities for plan/implement/test workflows.
              </div>
            </div>
            <div className="slides-step">
              <div className="n">D</div>
              <div className="t">Checkpoints</div>
              <div className="d">Branching + diffs + tests before merge.</div>
            </div>
          </div>
        </section>

        {/* Slide 13 */}
        <section
          className={`slides-slide ${index === 12 ? "is-active" : index === 11 ? "is-prev" : ""}`}
          data-title="PRD to plan to implement"
        >
          <div className="slides-eyebrow">Core workflow</div>
          <h2>PRD → Plan → Implement</h2>
          <p>Make the work legible, scoped, and reviewable.</p>
          <div className="slides-flow" aria-label="Workflow steps">
            <div className="slides-step">
              <div className="n">01</div>
              <div className="t">PRD</div>
              <div className="d">
                Human-owned requirements and acceptance criteria.
              </div>
            </div>
            <div className="slides-step">
              <div className="n">02</div>
              <div className="t">Plan</div>
              <div className="d">Agent generates stepwise tasks with checkboxes.</div>
            </div>
            <div className="slides-step">
              <div className="n">03</div>
              <div className="t">Implement</div>
              <div className="d">Execute in batches; pause for review.</div>
            </div>
            <div className="slides-step">
              <div className="n">04</div>
              <div className="t">Validate</div>
              <div className="d">Write/run tests; re-audit; iterate safely.</div>
            </div>
          </div>
        </section>

        {/* Slide 14 */}
        <section
          className={`slides-slide ${index === 13 ? "is-active" : index === 12 ? "is-prev" : ""}`}
          data-title="Review diffs"
        >
          <div className="slides-eyebrow">Non-negotiable</div>
          <h2>Always Review the Diffs</h2>
          <ul>
            <li>AI writes code — humans accept risk.</li>
            <li>Review changes in Source Control before merging.</li>
            <li>Small batches reduce surprises and drift.</li>
          </ul>
          <div className="slides-card" style={{ marginTop: 14 }}>
            <h3>Checkpoint mindset</h3>
            <ul>
              <li>Create a feature branch</li>
              <li>Implement 1–N steps</li>
              <li>Review diffs</li>
              <li>Run tests</li>
              <li>Continue or adjust scope</li>
            </ul>
          </div>
        </section>

        {/* Slide 15 */}
        <section
          className={`slides-slide ${index === 14 ? "is-active" : index === 13 ? "is-prev" : ""}`}
          data-title="Wrap + adoption"
        >
          <div className="slides-eyebrow">Wrap up</div>
          <h2>Key Takeaway</h2>
          <p>
            Left on its own, AI gives you terrible dad jokes.
            <br />
            Inside a disciplined workflow, it can help ship real features.
          </p>
          <div className="slides-card" style={{ marginTop: 16 }}>
            <h3>Adoption Playbook</h3>
            <ul>
              <li>Write accurate, clearly scoped PRDs</li>
              <li>Start with one small, low-risk repo</li>
              <li>
                Add a minimal <span className="slides-highlight">AGENTS.md</span>
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

      <footer className="slides-footer">
        <div className="slides-help" aria-label="Keyboard shortcuts">
          <span className="slides-kbd">← / →</span>
          <span className="slides-kbd">Space</span>
          <span className="slides-kbd">Home / End</span>
          <span className="slides-kbd">F</span>
          <span className="slides-kbd">?</span>
          <span className="slides-kbd">Esc</span>
        </div>
        <div aria-label="Current slide title">{title}</div>
      </footer>

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
