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
        examples: [{ selector: "html", snippet: '<html lang="en">' }],
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
        examples: [{ selector: "title", snippet: "<title>Example Domain</title>" }],
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
          {
            selector: "meta[name=viewport]",
            snippet:
              '<meta name="viewport" content="width=device-width, initial-scale=1">',
          },
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
          { selector: "img.hero-image", snippet: '<img src="/hero.jpg">' },
          { selector: "img.team-photo", snippet: '<img src="/team-photo.png">' },
          {
            selector: "img.icon-download",
            snippet: '<img src="/icon-download.svg">',
          },
        ],
        exampleCount: 3,
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
          {
            selector: "#search",
            snippet: '<input type="text" id="search">',
          },
          {
            selector: "input[type=email]",
            snippet: '<input type="email" placeholder="Email">',
          },
        ],
        exampleCount: 2,
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
          {
            selector: "button.icon-btn",
            snippet: '<button class="icon-btn"><svg>...</svg></button>',
          },
        ],
        exampleCount: 1,
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
        examples: [{ selector: "h1", snippet: "<h1>Example Domain</h1>" }],
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
          {
            selector: "h1 + h2 + h3",
            snippet: "h1 -> h2 -> h3 (no skipped levels detected)",
          },
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
          { selector: "a.cta-link", snippet: '<a href="/docs">Click here</a>' },
          { selector: "a.read-more", snippet: '<a href="/blog/post-1">Read more</a>' },
          { selector: "a.read-more", snippet: '<a href="/blog/post-2">Read more</a>' },
          {
            selector: "a.learn-link",
            snippet: '<a href="/learn">Click here to learn more</a>',
          },
        ],
        exampleCount: 4,
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
        examples: [],
      },
    },
  ],
  meta: {
    fetchTimeMs: 842,
    htmlBytes: 151552,
  },
}
