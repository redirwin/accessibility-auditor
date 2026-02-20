import type { AuditResponse } from "@/src/audit/types"

export const MOCK_RESPONSE: AuditResponse = {
  url: "https://example.com",
  summary: {
    score: 72,
    passes: 6,
    warnings: 2,
    fails: 2,
  },
  checks: [
    {
      id: "doc-lang",
      title: "Document language",
      status: "pass",
      hint: "The <html> element has a valid lang attribute.",
      details: {
        summary:
          "A lang attribute on the <html> element helps screen readers pick the correct pronunciation rules.",
        examples: ['<html lang="en"> detected.'],
      },
    },
    {
      id: "page-title",
      title: "Page title",
      status: "pass",
      hint: "The page has a descriptive <title> element.",
      details: {
        summary:
          "A descriptive title helps users understand the page purpose and is announced by screen readers on navigation.",
        examples: ["<title>Example Domain</title>"],
      },
    },
    {
      id: "viewport-meta",
      title: "Viewport meta",
      status: "pass",
      hint: "A viewport meta tag with width=device-width is present.",
      details: {
        summary:
          "The viewport meta tag ensures the page scales correctly on mobile devices.",
        examples: [
          '<meta name="viewport" content="width=device-width, initial-scale=1">',
        ],
      },
    },
    {
      id: "img-alt",
      title: "Images missing alt text",
      status: "fail",
      count: 3,
      hint: "3 images are missing alt attributes.",
      details: {
        summary:
          "Images without alt text are invisible to screen readers. Every informative image should describe its content.",
        examples: [
          '<img src="/hero.jpg"> (line 42)',
          '<img src="/team-photo.png"> (line 108)',
          '<img src="/icon-download.svg"> (line 215)',
        ],
      },
    },
    {
      id: "input-label",
      title: "Inputs missing accessible name",
      status: "warn",
      count: 2,
      hint: "2 form inputs lack an associated label or aria-label.",
      details: {
        summary:
          "Form controls without labels make it difficult for assistive technology users to understand the input purpose.",
        examples: [
          '<input type="text" id="search"> (line 55) \u2014 no associated <label>',
          '<input type="email" placeholder="Email"> (line 89) \u2014 placeholder is not a substitute for a label',
        ],
      },
    },
    {
      id: "btn-label",
      title: "Buttons missing accessible name",
      status: "warn",
      count: 1,
      hint: "1 button has no discernible text.",
      details: {
        summary:
          "Buttons without text or aria-label are unreadable by assistive technology. Ensure every button has visible text or an aria-label.",
        examples: [
          '<button class="icon-btn"><svg>...</svg></button> (line 132) \u2014 no text or aria-label',
        ],
      },
    },
    {
      id: "h1-presence",
      title: "H1 presence",
      status: "pass",
      hint: "The page contains exactly one <h1> element.",
      details: {
        summary:
          "A single H1 per page helps users and search engines understand the main topic of the page.",
        examples: ["<h1>Example Domain</h1>"],
      },
    },
    {
      id: "heading-order",
      title: "Heading order",
      status: "pass",
      hint: "Headings follow a logical hierarchy (h1 \u2192 h2 \u2192 h3).",
      details: {
        summary:
          "Maintaining proper heading order ensures content structure is understandable when navigating by headings.",
        examples: [
          "h1 \u2192 h2 \u2192 h3 \u2014 no skipped levels detected.",
        ],
      },
    },
    {
      id: "link-text",
      title: "Non-descriptive link text",
      status: "fail",
      count: 4,
      hint: '4 links use generic text like "click here" or "read more."',
      details: {
        summary:
          "Links with generic text provide no context when read out of context. Use descriptive link text that indicates the destination.",
        examples: [
          '"Click here" (line 78)',
          '"Read more" (line 145)',
          '"Read more" (line 198)',
          '"Click here to learn more" (line 261)',
        ],
      },
    },
    {
      id: "dup-ids",
      title: "Duplicate IDs",
      status: "pass",
      hint: "No duplicate id attributes found in the document.",
      details: {
        summary:
          "Duplicate IDs can cause issues with label associations, fragment links, and ARIA references.",
        examples: ["All id attributes are unique."],
      },
    },
  ],
  meta: {
    fetchTimeMs: 842,
    htmlBytes: 151552,
  },
}
