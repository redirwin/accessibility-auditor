"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ScanEye, ArrowLeft, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  StateSimulator,
  type SimulatorState,
} from "@/components/state-simulator"
import { useState } from "react"

export default function AboutPage() {
  const router = useRouter()
  const [simulatorState, setSimulatorState] = useState<SimulatorState>("auto")

  const handleSimulatorChange = (state: SimulatorState) => {
    setSimulatorState(state)
    if (state === "auto") {
      router.push("/")
    } else {
      router.push(`/?simulate=${state}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <ScanEye className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Accessibility Auditor
            </h1>
            <p className="text-sm text-muted-foreground">About</p>
          </div>
          <Link
            href="/"
            className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>
      </header>

      <Link
        href="/slides"
        className="fixed bottom-4 right-4 z-50 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Slides"
      >
        <Presentation className="size-5" aria-hidden />
      </Link>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              About this tool
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The Accessibility Auditor runs a lightweight set of checks on a
              single page. Enter a public URL to fetch the HTML and receive a
              score plus pass/warn/fail results for document language, page
              title, viewport, images, form controls, headings, links, and
              duplicate IDs. Results are for informational use and do not replace
              full WCAG or axe-core testing.
            </p>
          </div>

          <div className="mt-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to auditor
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto grid max-w-4xl grid-cols-2 items-center gap-3 px-4 py-4 sm:px-6">
          <p className="justify-self-start text-xs text-muted-foreground">
            Created by David Irwin using AI agents
          </p>
          <div className="justify-self-end">
            <StateSimulator
              state={simulatorState}
              onStateChange={handleSimulatorChange}
              className="scale-90 origin-center border-none bg-transparent px-0 py-0 opacity-70"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
