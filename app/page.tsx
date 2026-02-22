"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UrlAuditForm } from "@/components/url-audit-form";
import {
  StateSimulator,
  type AppState,
  type SimulatorState,
} from "@/components/state-simulator";
import { ResultsPanel } from "@/components/results-panel";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_RESPONSE } from "@/lib/mock-data";
import type { AuditResponse } from "@/src/audit/types";
import Link from "next/link";
import { ScanEye, AlertCircle, X, Loader2, Globe, Presentation } from "lucide-react";

type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "URL_BLOCKED"
  | "FETCH_TIMEOUT"
  | "RESPONSE_TOO_LARGE"
  | "UPSTREAM_FETCH_FAILED"
  | "HTML_PARSE_FAILED"
  | "INTERNAL_ERROR";

const DEFAULT_ERROR_MESSAGE =
  "We couldn't complete the audit. Please check the URL and try again.";

const ERROR_MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "Please enter a valid public http/https URL.",
  URL_BLOCKED: "That URL is blocked for security reasons. Try a public URL.",
  FETCH_TIMEOUT: "The request timed out. Please try again.",
  RESPONSE_TOO_LARGE: "The page is too large to audit (over 2 MB).",
  UPSTREAM_FETCH_FAILED: "We couldn't fetch that URL. Please try again.",
  HTML_PARSE_FAILED: "We couldn't process the page content from that URL.",
  INTERNAL_ERROR: "Unexpected server error while running the audit.",
};

function extractErrorMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null
  ) {
    const code = (payload.error as { code?: unknown }).code;
    if (typeof code === "string" && code in ERROR_MESSAGE_BY_CODE) {
      return ERROR_MESSAGE_BY_CODE[code as ApiErrorCode];
    }

    const message = (payload.error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}

const SIMULATE_VALUES: AppState[] = ["idle", "loading", "success", "error"];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulateParam = searchParams.get("simulate");
  const urlSimulate = useMemo(
    () =>
      SIMULATE_VALUES.includes(simulateParam as AppState)
        ? (simulateParam as AppState)
        : null,
    [simulateParam],
  );
  const [simulatorState, setSimulatorState] = useState<SimulatorState>("auto");

  const [appState, setAppState] = useState<AppState>("idle");
  const [url, setUrl] = useState("");
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(DEFAULT_ERROR_MESSAGE);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const displayState: AppState = urlSimulate ?? appState;

  useEffect(() => {
    setSimulatorState(urlSimulate ?? "auto");
  }, [urlSimulate]);

  const handleAudit = async () => {
    if (urlSimulate) {
      setSimulatorState("auto");
      router.replace("/");
    }
    setAppState("loading");
    setErrorDismissed(false);
    setErrorMessage(DEFAULT_ERROR_MESSAGE);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setErrorMessage(extractErrorMessage(payload));
        setAuditResult(null);
        setAppState("error");
        return;
      }

      setAuditResult(payload as AuditResponse);
      setAppState("success");
    } catch {
      setErrorMessage(
        "Network error while running the audit. Please try again.",
      );
      setAuditResult(null);
      setAppState("error");
    }
  };

  const handleReset = () => {
    setUrl("");
    setAppState("idle");
    setErrorDismissed(false);
    setErrorMessage(DEFAULT_ERROR_MESSAGE);
    setAuditResult(null);
  };

  const handleStateChange = (state: SimulatorState) => {
    setSimulatorState(state);
    if (state === "auto") {
      router.push("/");
      return;
    }
    router.push(`/?simulate=${state}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <ScanEye className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground text-balance">
              Accessibility Auditor
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste a URL to run a lightweight accessibility check.
            </p>
          </div>
          <Link
            href="/about"
            className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            About
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

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {/* URL Input Form */}
          <UrlAuditForm
            url={url}
            onUrlChange={setUrl}
            onAudit={handleAudit}
            onReset={handleReset}
            isLoading={displayState === "loading"}
          />

          {/* Loading State */}
          {displayState === "loading" && <LoadingSkeleton />}

          {/* Error State */}
          {displayState === "error" && !errorDismissed && (
            <Alert variant="destructive" className="relative">
              <AlertCircle className="size-4" />
              <AlertTitle>Audit failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 size-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                onClick={() => setErrorDismissed(true)}
              >
                <X className="size-3.5" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </Alert>
          )}

          {/* Success State */}
          {displayState === "success" && (
            <ResultsPanel
              data={
                auditResult ?? {
                  ...MOCK_RESPONSE,
                  url: url || MOCK_RESPONSE.url,
                }
              }
            />
          )}

          {/* Idle State */}
          {displayState === "idle" && <IdleState />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto grid max-w-4xl grid-cols-2 items-center gap-3 px-4 py-4 sm:px-6">
          <p className="justify-self-start text-xs text-muted-foreground">
            Created by David Irwin using AI agents
          </p>
          <div className="justify-self-end">
            <StateSimulator
              state={simulatorState}
              onStateChange={handleStateChange}
              className="scale-90 origin-center border-none bg-transparent px-0 py-0 opacity-70"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Loading indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>Auditing page...</span>
      </div>

      {/* Summary skeleton */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="size-[100px] shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>

      {/* Checks skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-16" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
            >
              <Skeleton className="h-6 w-14 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="size-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 gap-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Globe className="size-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Enter a URL to run an audit
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Results will appear here after your audit completes.
        </p>
      </div>
    </div>
  );
}
