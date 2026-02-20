import { load } from "cheerio"
import { describe, expect, it } from "vitest"
import { runMvpRules } from "@/src/audit/rules"

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
})
