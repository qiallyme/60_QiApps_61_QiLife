import { Route, Routes } from "react-router-dom";
import { useState } from "react";

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

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  function handleCaptured() {
    setRefreshToken((current) => current + 1);
  }

  return (
    <AppShell contextDock={<ContextDock />} quickCapture={<QuickCapture onCaptured={handleCaptured} />}>
      <Routes>
        <Route path="/" element={<TodayPage refreshToken={refreshToken} />} />
        <Route path="/timeline" element={<TimelinePage refreshToken={refreshToken} />} />
        <Route path="/inbox" element={<InboxPage refreshToken={refreshToken} />} />
        <Route path="/threads" element={<ThreadsPage refreshToken={refreshToken} />} />
        <Route path="/actions" element={<ActionsPage refreshToken={refreshToken} />} />
        <Route path="/people" element={<PeoplePage refreshToken={refreshToken} />} />
        <Route
          path="/calendar"
          element={<PlaceholderPage title="Calendar" description="Events and scheduled actions will land here next, driven by the canonical timeline and event model." />}
        />
        <Route
          path="/money"
          element={<PlaceholderPage title="Money" description="Transactions and obligations will expand into a dedicated ledger once the money layer is wired on top of the spine." />}
        />
        <Route
          path="/knowledge"
          element={<PlaceholderPage title="Knowledge" description="Repo docs and durable in-app knowledge will converge here through the importer and Context Dock." />}
        />
        <Route
          path="/documents"
          element={<PlaceholderPage title="Documents" description="Document metadata and local file references will be attached to QiBits, Threads, and Money records here." />}
        />
        <Route
          path="/ask"
          element={<PlaceholderPage title="Ask QiLife" description="The AI layer will query the ledger with cited supporting records after the staged AI review flow is fully wired." />}
        />
      </Routes>
    </AppShell>
  );
}
