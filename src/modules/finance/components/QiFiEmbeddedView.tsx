import { useState } from "react";
import type { EntityLink, QiBit } from "../../../features/qilife/types";

interface QiFiEmbeddedViewProps {
  linkedProjects?: QiBit[];
  linkedTasks?: QiBit[];
  onLinkCreated?: (link: EntityLink) => void;
}

export function QiFiEmbeddedView({
  linkedProjects = [],
  linkedTasks = [],
  onLinkCreated,
}: QiFiEmbeddedViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "receipts" | "accounts">("overview");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  const mockTransactions = [
    { id: "tx_101", date: "2026-08-11", description: "Cloud Infrastructure & Hosting", amount: "$149.00", category: "Software & Hosting", account: "Business Checking" },
    { id: "tx_102", date: "2026-08-10", description: "Legal Consultation Fee", amount: "$350.00", category: "Legal & Professional", account: "Credit Card" },
    { id: "tx_103", date: "2026-08-08", description: "Office Supplies", amount: "$84.50", category: "Office Expenses", account: "Business Checking" },
  ];

  const handleCreateLink = (transactionId: string) => {
    if (!selectedProject && !selectedTask) return;

    const link: EntityLink = {
      id: `link_${Math.random().toString(36).slice(2)}`,
      sourceEntityType: selectedProject ? "project" : "task",
      sourceId: selectedProject || selectedTask,
      targetEntityType: "expense",
      targetId: transactionId,
      relationshipType: "cost_center",
      createdAt: new Date().toISOString(),
    };

    if (onLinkCreated) onLinkCreated(link);
    alert(`Successfully linked financial transaction ${transactionId} to QiLife item!`);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.25rem" }}>
            QiFi — Financial Subsystem
          </h1>
          <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
            Bills, receipts, ledger transactions, reconciliation, and cross-item financial linkages.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid #e5e7eb", marginBottom: "1.5rem" }}>
        {(["overview", "ledger", "receipts", "accounts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              textTransform: "capitalize",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "3px solid #2563eb" : "3px solid transparent",
              color: activeTab === tab ? "#2563eb" : "#4b5563",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cross-Item Linking Control */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "600", color: "#334155", fontSize: "0.9rem" }}>🔗 Link Expense to QiLife Item:</span>
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); setSelectedTask(""); }}
          style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
        >
          <option value="">Select Project...</option>
          {linkedProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <select
          value={selectedTask}
          onChange={(e) => { setSelectedTask(e.target.value); setSelectedProject(""); }}
          style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
        >
          <option value="">Select Action/Task...</option>
          {linkedTasks.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Financial Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.85rem", color: "#1e40af" }}>Total Monthly Expenses</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>$583.50</div>
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.85rem", color: "#166534" }}>Reconciled Transactions</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#14532d" }}>100%</div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "overview" || activeTab === "ledger") && (
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#111827", marginBottom: "0.75rem" }}>Master Ledger Transactions</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem" }}>Date</th>
                  <th style={{ padding: "0.75rem" }}>Description</th>
                  <th style={{ padding: "0.75rem" }}>Category</th>
                  <th style={{ padding: "0.75rem" }}>Amount</th>
                  <th style={{ padding: "0.75rem" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem", color: "#6b7280" }}>{tx.date}</td>
                    <td style={{ padding: "0.75rem", fontWeight: "500", color: "#111827" }}>{tx.description}</td>
                    <td style={{ padding: "0.75rem", color: "#4b5563" }}>{tx.category}</td>
                    <td style={{ padding: "0.75rem", fontWeight: "600", color: "#111827" }}>{tx.amount}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <button
                        onClick={() => handleCreateLink(tx.id)}
                        style={{ background: "#e0e7ff", color: "#3730a3", border: "none", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "500" }}
                      >
                        Link to Selected Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
