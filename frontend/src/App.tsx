import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkBackendHealth } from "./api/client";

import { AppShell } from "./components/app-shell";
import { ContextDock } from "./components/context-dock";
import { QuickCapture } from "./components/quick-capture";
import { ActionsPage } from "./pages/actions-page";
import { InboxPage } from "./pages/inbox-page";
import { PeoplePage } from "./pages/people-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { ThreadsPage } from "./pages/threads-page";
import { TimelinePage } from "./pages/timeline-page";
import { TodayPage } from "./pages/today-page";
import { CapturePage } from "./pages/capture-page";
import { ReviewPage } from "./pages/review-page";

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    checkBackendHealth().then(isUp => {
      setBackendStatus(isUp ? "online" : "offline");
    });
  }, []);

  function handleCaptured() {
    setRefreshToken((n) => n + 1);
  }

  return (
    <AppShell 
      contextDock={<ContextDock />} 
      quickCapture={<QuickCapture onCaptured={handleCaptured} />}
      backendStatus={backendStatus}
    >
      <Routes>
        <Route path="/" element={<TodayPage refreshToken={refreshToken} />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/timeline" element={<TimelinePage refreshToken={refreshToken} />} />
        <Route path="/inbox" element={<InboxPage refreshToken={refreshToken} />} />
        <Route path="/threads" element={<ThreadsPage refreshToken={refreshToken} />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/people" element={<PeoplePage refreshToken={refreshToken} />} />
        <Route
          path="/calendar"
          element={
            <PlaceholderPage
              title="Calendar"
              description="Events and scheduled actions driven by the canonical timeline and event model. Linked to QiBits and threads by source_qibit_id."
              phase="Phase 2"
            />
          }
        />
        <Route
          path="/money"
          element={
            <PlaceholderPage
              title="Money"
              description="Transactions stored in cents (no float errors). Obligations track who owes what. All linked back to QiBits for full provenance."
              phase="Phase 4"
            />
          }
        />
        <Route
          path="/knowledge"
          element={
            <PlaceholderPage
              title="Knowledge"
              description="Write once in Markdown, index everywhere. Repo docs are imported as read-only system items. Knowledge links to buckets, threads, and people."
              phase="Phase 3"
            />
          }
        />
        <Route
          path="/documents"
          element={
            <PlaceholderPage
              title="Documents"
              description="File metadata attached to QiBits and threads. file_hash ensures integrity. Local paths only in v1 — no cloud sync."
              phase="Phase 3"
            />
          }
        />
        <Route
          path="/ask"
          element={
            <PlaceholderPage
              title="Ask QiLife"
              description="Queries the full ledger with cited supporting records. AI suggestions staged via ai_outputs until approved. No silent writes to primary tables."
              phase="Phase 5"
            />
          }
        />
      </Routes>
    </AppShell>
  );
}
