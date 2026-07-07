import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { checkBackendHealth, listActionsFromBackend, listPeopleFromBackend, listQiBitsFromBackend, listThreadsFromBackend, listTimelineFromBackend } from "./api/client";

import { AppShell } from "./components/app-shell";
import { ContextDock } from "./components/context-dock";
import { QuickCapture } from "./components/quick-capture";
import { ActionsPage } from "./pages/actions-page";
import { InboxPage } from "./pages/inbox-page";
import { KnowledgePage } from "./pages/knowledge-page";
import { MorePage } from "./pages/more-page";
import { PeoplePage } from "./pages/people-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { CockpitPage } from "./pages/cockpit-page";
import { ThreadsPage } from "./pages/threads-page";
import { TimelinePage } from "./pages/timeline-page";
import { TodayPage } from "./pages/today-page";
import { CapturePage } from "./pages/capture-page";
import { ReviewPage } from "./pages/review-page";
import { QiBitDetailPage } from "./pages/qibit-detail-page";
import { ActionDetailPage } from "./pages/action-detail-page";
import { PersonDetailPage } from "./pages/person-detail-page";
import { ThreadDetailPage } from "./pages/thread-detail-page";
import { replaceActions, replacePeople, replaceQiBits, replaceThreads, replaceTimelineItems } from "./utils/storage";

const AlphaWorkbenchPage = React.lazy(() => import("./features/alpha_qilife_workbench/components/AlphaWorkbenchPage"));
const QiLifeShell        = React.lazy(() => import("./features/qilife/components/QiLifeShell").then((m) => ({ default: m.QiLifeShell })));
const AuthProvider       = React.lazy(() => import("./features/qilife/auth/AuthProvider").then((m) => ({ default: m.AuthProvider })));

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    checkBackendHealth().then(isUp => {
      setBackendStatus(isUp ? "online" : "offline");
    });
  }, []);

  useEffect(() => {
    if (backendStatus !== "online") return;

    let active = true;

    Promise.all([
      listQiBitsFromBackend(),
      listActionsFromBackend(),
      listTimelineFromBackend(),
      listThreadsFromBackend(),
      listPeopleFromBackend(),
    ])
      .then(([qibits, actions, timeline, threads, people]) => {
        if (!active) return;
        replaceQiBits(qibits);
        replaceActions(actions);
        replaceTimelineItems(timeline);
        replaceThreads(threads);
        replacePeople(people);
        setRefreshToken((n) => n + 1);
      })
      .catch((error) => {
        console.warn("Backend sync failed. Keeping local fallback state.", error);
      });

    return () => {
      active = false;
    };
  }, [backendStatus]);

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
        <Route path="/cockpit" element={<CockpitPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/timeline" element={<TimelinePage refreshToken={refreshToken} />} />
        <Route path="/knowledge" element={<KnowledgePage backendStatus={backendStatus} />} />
        <Route path="/actions" element={<ActionsPage refreshToken={refreshToken} />} />
        <Route path="/qibits/:id" element={<QiBitDetailPage refreshToken={refreshToken} />} />
        <Route path="/actions/:id" element={<ActionDetailPage refreshToken={refreshToken} />} />
        <Route path="/inbox" element={<InboxPage refreshToken={refreshToken} />} />
        <Route path="/people" element={<PeoplePage refreshToken={refreshToken} />} />
        <Route path="/people/:id" element={<PersonDetailPage refreshToken={refreshToken} />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/threads" element={<ThreadsPage refreshToken={refreshToken} />} />
        <Route path="/threads/:id" element={<ThreadDetailPage refreshToken={refreshToken} />} />
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
        <Route
          path="/alpha/qilife-workbench"
          element={
            <React.Suspense fallback={<div>Loading Workbench...</div>}>
              <AlphaWorkbenchPage />
            </React.Suspense>
          }
        />
        <Route
          path="/qilife/*"
          element={
            <React.Suspense fallback={<div style={{ padding: 40, color: '#96a39b' }}>Loading QiLife…</div>}>
              <AuthProvider>
                <QiLifeShell />
              </AuthProvider>
            </React.Suspense>
          }
        />
      </Routes>
    </AppShell>
  );
}
