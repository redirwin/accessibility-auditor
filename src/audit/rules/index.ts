import type { CheerioAPI } from "cheerio"
import type { AuditCheck, AuditStatus } from "@/src/audit/types"

const RULE_ORDER = [
  "doc-lang",
  "page-title",
  "viewport-meta",
  "img-alt",
  "input-label",
  "btn-label",
  "h1-presence",
  "heading-order",
  "link-text",
  "dup-ids",
] as const

const RULE_TITLES: Record<(typeof RULE_ORDER)[number], string> = {
  "doc-lang": "Document language",
  "page-title": "Page title",
  "viewport-meta": "Viewport meta",
  "img-alt": "Images missing alt text",
  "input-label": "Inputs missing accessible name",
  "btn-label": "Buttons missing accessible name",
  "h1-presence": "H1 presence",
  "heading-order": "Heading order",
  "link-text": "Non-descriptive link text",
  "dup-ids": "Duplicate IDs",
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function buildCheck(check: AuditCheck): AuditCheck {
  return {
    ...check,
    status: normalizeStatus(check.status),
    details: {
      summary: check.details?.summary ?? "",
      examples: check.details?.examples ?? [],
    },
  }
}

function normalizeStatus(status: string): AuditStatus {
  if (status === "pass" || status === "warn" || status === "fail") return status
  return "warn"
}

function truncate(value: string, maxLength = 140): string {
  const normalized = normalizeWhitespace(value)
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}...`
}

function hasAccessibleName(
  $: CheerioAPI,
  element: cheerio.Element,
  options: { allowVisibleText?: boolean } = {}
): boolean {
  const node = $(element)

  const ariaLabel = node.attr("aria-label")
  if (ariaLabel && normalizeWhitespace(ariaLabel)) return true

  const ariaLabelledBy = node.attr("aria-labelledby")
  if (ariaLabelledBy && normalizeWhitespace(ariaLabelledBy)) return true

  const title = node.attr("title")
  if (title && normalizeWhitespace(title)) return true

  const id = node.attr("id")
  if (id) {
    const explicitLabelCount = $("label[for]").filter((_, label) => {
      return ($(label).attr("for") ?? "") === id
    }).length

    if (explicitLabelCount > 0) return true
  }

  if (node.closest("label").length > 0) return true

  if (options.allowVisibleText) {
    const visibleText = normalizeWhitespace(node.text())
    if (visibleText) return true
  }

  return false
}

function ruleDocumentLanguage($: CheerioAPI): AuditCheck {
  const lang = ($("html").first().attr("lang") ?? "").trim()
  const langPattern = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i

  if (!lang) {
    return buildCheck({
      id: "doc-lang",
      title: RULE_TITLES["doc-lang"],
      status: "fail",
      hint: "The <html> element is missing a lang attribute.",
      details: {
        summary: "Set a language on <html> so assistive tech can apply the correct pronunciation rules.",
        examples: ['Add: <html lang="en">'],
      },
    })
  }

  if (!langPattern.test(lang)) {
    return buildCheck({
      id: "doc-lang",
      title: RULE_TITLES["doc-lang"],
      status: "warn",
      hint: `The lang attribute value "${lang}" may be invalid.`,
      details: {
        summary: "Use a valid BCP 47 language tag value for the page language.",
        examples: ['Example: <html lang="en">'],
      },
    })
  }

  return buildCheck({
    id: "doc-lang",
    title: RULE_TITLES["doc-lang"],
    status: "pass",
    hint: "The <html> element has a valid lang attribute.",
    details: {
      summary: "Page language is declared for assistive technologies.",
      examples: [`Detected: <html lang="${lang}">`],
    },
  })
}

function rulePageTitle($: CheerioAPI): AuditCheck {
  const titleText = normalizeWhitespace($("title").first().text())
  if (!titleText) {
    return buildCheck({
      id: "page-title",
      title: RULE_TITLES["page-title"],
      status: "fail",
      hint: "The page is missing a non-empty <title> element.",
      details: {
        summary: "Add a descriptive page title to support navigation and screen reader context.",
        examples: ["Example: <title>Page title</title>"],
      },
    })
  }

  return buildCheck({
    id: "page-title",
    title: RULE_TITLES["page-title"],
    status: "pass",
    hint: "The page has a non-empty title.",
    details: {
      summary: "A descriptive title was found.",
      examples: [`Detected: <title>${truncate(titleText)}</title>`],
    },
  })
}

function ruleViewportMeta($: CheerioAPI): AuditCheck {
  const hasViewport = $("meta[name]").filter((_, el) => {
    return (($(el).attr("name") ?? "").toLowerCase() === "viewport")
  }).length > 0

  if (!hasViewport) {
    return buildCheck({
      id: "viewport-meta",
      title: RULE_TITLES["viewport-meta"],
      status: "warn",
      hint: "No viewport meta tag was found.",
      details: {
        summary: "Add a viewport meta tag to improve mobile rendering behavior.",
        examples: ['Example: <meta name="viewport" content="width=device-width, initial-scale=1">'],
      },
    })
  }

  return buildCheck({
    id: "viewport-meta",
    title: RULE_TITLES["viewport-meta"],
    status: "pass",
    hint: "A viewport meta tag is present.",
    details: {
      summary: "Viewport metadata was detected.",
      examples: [],
    },
  })
}

function ruleImagesMissingAlt($: CheerioAPI): AuditCheck {
  const offenders = $("img").filter((_, img) => {
    return $(img).attr("alt") === undefined
  })
  const count = offenders.length

  if (count > 0) {
    const examples = offenders
      .slice(0, 3)
      .map((_, img) => truncate($.html(img) ?? "<img>"))
      .get()

    return buildCheck({
      id: "img-alt",
      title: RULE_TITLES["img-alt"],
      status: "fail",
      count,
      hint: `${count} image${count === 1 ? " is" : "s are"} missing an alt attribute.`,
      details: {
        summary: "Informative images should include meaningful alt text.",
        examples,
      },
    })
  }

  return buildCheck({
    id: "img-alt",
    title: RULE_TITLES["img-alt"],
    status: "pass",
    hint: "All images include an alt attribute.",
    details: {
      summary: "No image elements were missing alt attributes.",
      examples: [],
    },
  })
}

function ruleInputsMissingName($: CheerioAPI): AuditCheck {
  const controls = $("input, select, textarea").filter((_, control) => {
    if (control.tagName === "input") {
      return (($(control).attr("type") ?? "").toLowerCase() !== "hidden")
    }
    return true
  })

  const offenders = controls.filter((_, control) => {
    return !hasAccessibleName($, control)
  })
  const count = offenders.length

  if (count > 0) {
    const examples = offenders
      .slice(0, 3)
      .map((_, control) => truncate($.html(control) ?? `<${control.tagName}>`))
      .get()

    return buildCheck({
      id: "input-label",
      title: RULE_TITLES["input-label"],
      status: "fail",
      count,
      hint: `${count} form control${count === 1 ? "" : "s"} ${
        count === 1 ? "is" : "are"
      } missing an accessible name.`,
      details: {
        summary: "Inputs/selects/textareas need a label, ARIA label, or title.",
        examples,
      },
    })
  }

  return buildCheck({
    id: "input-label",
    title: RULE_TITLES["input-label"],
    status: "pass",
    hint: "All audited form controls have an accessible name.",
    details: {
      summary: "Each audited input/select/textarea had a detectable accessible name.",
      examples: [],
    },
  })
}

function ruleButtonsMissingName($: CheerioAPI): AuditCheck {
  const offenders = $("button").filter((_, button) => {
    return !hasAccessibleName($, button, { allowVisibleText: true })
  })
  const count = offenders.length

  if (count > 0) {
    const examples = offenders
      .slice(0, 3)
      .map((_, button) => truncate($.html(button) ?? "<button></button>"))
      .get()

    return buildCheck({
      id: "btn-label",
      title: RULE_TITLES["btn-label"],
      status: "fail",
      count,
      hint: `${count} button${count === 1 ? "" : "s"} ${
        count === 1 ? "is" : "are"
      } missing an accessible name.`,
      details: {
        summary: "Buttons need visible text, aria-label/labelledby, or a title.",
        examples,
      },
    })
  }

  return buildCheck({
    id: "btn-label",
    title: RULE_TITLES["btn-label"],
    status: "pass",
    hint: "All buttons have a detectable accessible name.",
    details: {
      summary: "Each button had text or another accessible naming mechanism.",
      examples: [],
    },
  })
}

function ruleH1Presence($: CheerioAPI): AuditCheck {
  const h1Count = $("h1").length

  if (h1Count === 0) {
    return buildCheck({
      id: "h1-presence",
      title: RULE_TITLES["h1-presence"],
      status: "fail",
      hint: "No <h1> element was found.",
      details: {
        summary: "Pages should include a primary heading.",
        examples: [],
      },
    })
  }

  if (h1Count > 1) {
    return buildCheck({
      id: "h1-presence",
      title: RULE_TITLES["h1-presence"],
      status: "warn",
      count: h1Count,
      hint: `${h1Count} <h1> elements were found.`,
      details: {
        summary: "Use a single primary <h1> where possible for clearer document structure.",
        examples: [],
      },
    })
  }

  return buildCheck({
    id: "h1-presence",
    title: RULE_TITLES["h1-presence"],
    status: "pass",
    hint: "Exactly one <h1> element was found.",
    details: {
      summary: "Primary heading structure looks good.",
      examples: [truncate($("h1").first().text())].filter(Boolean),
    },
  })
}

function ruleHeadingOrder($: CheerioAPI): AuditCheck {
  const headingLevels: number[] = []
  $("h1, h2, h3, h4, h5, h6").each((_, heading) => {
    const level = Number(heading.tagName.slice(1))
    if (Number.isInteger(level)) headingLevels.push(level)
  })

  const jumps: string[] = []
  for (let i = 1; i < headingLevels.length; i += 1) {
    const previous = headingLevels[i - 1]
    const current = headingLevels[i]
    if (current - previous > 1) {
      jumps.push(`h${previous} -> h${current}`)
    }
  }

  if (jumps.length > 0) {
    return buildCheck({
      id: "heading-order",
      title: RULE_TITLES["heading-order"],
      status: "warn",
      count: jumps.length,
      hint: `${jumps.length} heading level jump${jumps.length === 1 ? "" : "s"} detected.`,
      details: {
        summary: "Heading levels should not skip levels when descending through content.",
        examples: jumps.slice(0, 3),
      },
    })
  }

  return buildCheck({
    id: "heading-order",
    title: RULE_TITLES["heading-order"],
    status: "pass",
    hint: "No heading level jumps greater than one were found.",
    details: {
      summary: "Heading levels follow a consistent sequence.",
      examples: [],
    },
  })
}

function ruleNonDescriptiveLinkText($: CheerioAPI): AuditCheck {
  const nonDescriptive = new Set(["click here", "read more", "learn more", "more"])
  const offenders = $("a").filter((_, link) => {
    const text = normalizeWhitespace($(link).text()).toLowerCase()
    return nonDescriptive.has(text)
  })
  const count = offenders.length

  if (count > 0) {
    const examples = offenders
      .slice(0, 4)
      .map((_, link) => truncate(normalizeWhitespace($(link).text())))
      .get()

    return buildCheck({
      id: "link-text",
      title: RULE_TITLES["link-text"],
      status: "warn",
      count,
      hint: `${count} link${count === 1 ? "" : "s"} use non-descriptive text.`,
      details: {
        summary: "Prefer link text that communicates destination or action out of context.",
        examples,
      },
    })
  }

  return buildCheck({
    id: "link-text",
    title: RULE_TITLES["link-text"],
    status: "pass",
    hint: "No configured non-descriptive link phrases were detected.",
    details: {
      summary: "Audited links avoid the configured generic phrases.",
      examples: [],
    },
  })
}

function ruleDuplicateIds($: CheerioAPI): AuditCheck {
  const idCounts = new Map<string, number>()

  $("[id]").each((_, el) => {
    const id = ($(el).attr("id") ?? "").trim()
    if (!id) return
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1)
  })

  const duplicates = Array.from(idCounts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])

  if (duplicates.length > 0) {
    return buildCheck({
      id: "dup-ids",
      title: RULE_TITLES["dup-ids"],
      status: "fail",
      count: duplicates.length,
      hint: `${duplicates.length} duplicate id value${
        duplicates.length === 1 ? "" : "s"
      } detected.`,
      details: {
        summary: "Duplicate IDs can break label/ARIA references and in-page navigation.",
        examples: duplicates.slice(0, 3).map(([id, count]) => `${id} (${count} occurrences)`),
      },
    })
  }

  return buildCheck({
    id: "dup-ids",
    title: RULE_TITLES["dup-ids"],
    status: "pass",
    hint: "No duplicate id values were found.",
    details: {
      summary: "All discovered id attributes are unique.",
      examples: [],
    },
  })
}

export function runMvpRules($: CheerioAPI): AuditCheck[] {
  const checksById = new Map<(typeof RULE_ORDER)[number], AuditCheck>([
    ["doc-lang", ruleDocumentLanguage($)],
    ["page-title", rulePageTitle($)],
    ["viewport-meta", ruleViewportMeta($)],
    ["img-alt", ruleImagesMissingAlt($)],
    ["input-label", ruleInputsMissingName($)],
    ["btn-label", ruleButtonsMissingName($)],
    ["h1-presence", ruleH1Presence($)],
    ["heading-order", ruleHeadingOrder($)],
    ["link-text", ruleNonDescriptiveLinkText($)],
    ["dup-ids", ruleDuplicateIds($)],
  ])

  return RULE_ORDER.map((ruleId) => {
    const check = checksById.get(ruleId)
    if (check) return check

    return buildCheck({
      id: ruleId,
      title: RULE_TITLES[ruleId],
      status: "warn",
      hint: "Rule did not return a result.",
      details: {
        summary: "Fallback rule result.",
        examples: [],
      },
    })
  })
}
