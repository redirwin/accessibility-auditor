import { load } from "cheerio"
import { describe, expect, it } from "vitest"
import {
  buildElementSelector,
  collectExamples,
  getTrimmedOuterHtml,
  runMvpRules,
} from "@/src/audit/rules"

function run(html: string) {
  const checks = runMvpRules(load(html))
  return new Map(checks.map((check) => [check.id, check]))
}

describe("runMvpRules", () => {
  it("evaluates document language with fail/warn/pass", () => {
    expect(run("<html><head></head><body></body></html>").get("doc-lang")?.status).toBe("fail")
    expect(run('<html lang="invalid_lang"><head></head><body></body></html>').get("doc-lang")?.status).toBe("warn")
    expect(run('<html lang="en"><head></head><body></body></html>').get("doc-lang")?.status).toBe("pass")
  })

  it("evaluates page title with fail/pass", () => {
    expect(run("<html><head></head></html>").get("page-title")?.status).toBe("fail")
    expect(run("<html><head><title>Hello</title></head></html>").get("page-title")?.status).toBe("pass")
  })

  it("evaluates viewport meta with warn/pass", () => {
    expect(run("<html><head></head></html>").get("viewport-meta")?.status).toBe("warn")
    expect(
      run('<html><head><meta name="viewport" content="width=device-width"></head></html>').get(
        "viewport-meta"
      )?.status
    ).toBe("pass")
  })

  it("evaluates image alt with fail/pass", () => {
    expect(run('<html><body><img src="x"></body></html>').get("img-alt")?.status).toBe("fail")
    expect(run('<html><body><img src="x" alt="desc"></body></html>').get("img-alt")?.status).toBe("pass")
  })

  it("evaluates input labels with fail/pass", () => {
    expect(run('<html><body><input id="a"></body></html>').get("input-label")?.status).toBe("fail")
    expect(
      run('<html><body><label for="a">Name</label><input id="a"></body></html>').get("input-label")
        ?.status
    ).toBe("pass")
  })

  it("evaluates button names with fail/pass", () => {
    expect(run("<html><body><button><svg></svg></button></body></html>").get("btn-label")?.status).toBe(
      "fail"
    )
    expect(run("<html><body><button>Submit</button></body></html>").get("btn-label")?.status).toBe(
      "pass"
    )
  })

  it("evaluates h1 presence with fail/warn/pass", () => {
    expect(run("<html><body></body></html>").get("h1-presence")?.status).toBe("fail")
    expect(run("<html><body><h1>A</h1><h1>B</h1></body></html>").get("h1-presence")?.status).toBe("warn")
    expect(run("<html><body><h1>A</h1></body></html>").get("h1-presence")?.status).toBe("pass")
  })

  it("evaluates heading order with warn/pass", () => {
    expect(run("<html><body><h1>A</h1><h3>B</h3></body></html>").get("heading-order")?.status).toBe("warn")
    expect(run("<html><body><h1>A</h1><h2>B</h2></body></html>").get("heading-order")?.status).toBe("pass")
  })

  it("evaluates non-descriptive links with warn/pass", () => {
    expect(run('<html><body><a href="#">click here</a></body></html>').get("link-text")?.status).toBe("warn")
    expect(run('<html><body><a href="#">Pricing details</a></body></html>').get("link-text")?.status).toBe(
      "pass"
    )
  })

  it("evaluates duplicate IDs with fail/pass", () => {
    expect(run('<html><body><div id="dup"></div><span id="dup"></span></body></html>').get("dup-ids")?.status).toBe(
      "fail"
    )
    expect(run('<html><body><div id="a"></div><span id="b"></span></body></html>').get("dup-ids")?.status).toBe(
      "pass"
    )
  })

  it("returns structured examples and exampleCount for fail/warn checks", () => {
    const checks = run(`
      <html>
        <head><title>Demo</title></head>
        <body>
          <img src="/a.png">
          <img src="/b.png">
          <img src="/c.png">
          <img src="/d.png">
          <img src="/e.png">
          <img src="/f.png">
          <a href="#">click here</a>
        </body>
      </html>
    `)

    const imgAlt = checks.get("img-alt")
    expect(imgAlt?.status).toBe("fail")
    expect(imgAlt?.details?.exampleCount).toBe(6)
    expect(imgAlt?.details?.examples).toBeDefined()
    expect(imgAlt?.details?.examples?.length).toBeLessThanOrEqual(5)
    expect(imgAlt?.details?.examples?.[0]).toHaveProperty("selector")
    expect(imgAlt?.details?.examples?.[0]).toHaveProperty("snippet")

    const linkText = checks.get("link-text")
    expect(linkText?.status).toBe("warn")
    expect(linkText?.details?.exampleCount).toBe(1)
    expect(linkText?.details?.examples?.[0]).toHaveProperty("selector")
    expect(linkText?.details?.examples?.[0]).toHaveProperty("snippet")
  })

  it("does not emit examples for pass checks", () => {
    const checks = run(`
      <html lang="en">
        <head>
          <title>Healthy Page</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <h1>Heading</h1>
          <img src="/ok.png" alt="description">
          <a href="/pricing">Pricing details</a>
        </body>
      </html>
    `)

    const passCheck = checks.get("img-alt")
    expect(passCheck?.status).toBe("pass")
    expect(passCheck?.details?.examples).toBeUndefined()
    expect(passCheck?.details?.exampleCount).toBeUndefined()
  })
})

describe("actionable finding helper utilities", () => {
  it("buildElementSelector prefers unique IDs", () => {
    const $ = load('<div id="hero"></div><div class="card featured"></div>')
    const idNode = $("#hero").get(0)
    if (!idNode) throw new Error("Expected #hero node")

    expect(buildElementSelector($, idNode)).toBe("#hero")
  })

  it("buildElementSelector falls back to tag and sorted classes when ID is absent/non-unique", () => {
    const $ = load('<button class="zeta alpha beta"></button><div id="dup"></div><span id="dup"></span>')
    const classNode = $("button").get(0)
    const dupNode = $("span#dup").get(0)
    if (!classNode || !dupNode) throw new Error("Expected test nodes")

    expect(buildElementSelector($, classNode)).toBe("button.alpha.beta")
    expect(buildElementSelector($, dupNode)).toBe("span")
  })

  it("getTrimmedOuterHtml trims with ellipsis and keeps readable markup", () => {
    const $ = load('<button class="icon-only"><svg><title>icon</title></svg></button>')
    const node = $("button").get(0)
    if (!node) throw new Error("Expected button node")

    const snippet = getTrimmedOuterHtml($, node, 20)
    expect(snippet).toContain("<button")
    expect(snippet.endsWith("...")).toBe(true)
    expect(snippet.length).toBeLessThanOrEqual(20)
  })

  it("collectExamples caps examples and preserves total outside the cap", () => {
    const $ = load("<ul>" + new Array(8).fill('<li class="item">x</li>').join("") + "</ul>")
    const elements = $("li").get()
    const examples = collectExamples($, elements, 5, 80)

    expect(elements).toHaveLength(8)
    expect(examples).toHaveLength(5)
    expect(examples[0]).toHaveProperty("selector")
    expect(examples[0]).toHaveProperty("snippet")
  })

  it("processes representative large HTML within target budget", () => {
    const html = `
      <html lang="en">
        <head><title>Perf</title></head>
        <body>
          ${new Array(1000).fill('<img class="hero" src="/x.png">').join("")}
          ${new Array(500).fill('<button class="icon-btn"><svg></svg></button>').join("")}
          ${new Array(500).fill('<a href="#">click here</a>').join("")}
        </body>
      </html>
    `

    const started = performance.now()
    runMvpRules(load(html))
    const elapsedMs = performance.now() - started

    expect(elapsedMs).toBeLessThan(500)
  })
})
