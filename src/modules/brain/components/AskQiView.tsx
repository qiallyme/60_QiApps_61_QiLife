import { useState } from "react";
import type { QiBit } from "../../../features/qilife/types";

interface AskQiViewProps {
  onQuery?: (query: string) => Promise<QiBit[]>;
}

export function AskQiView({ onQuery }: AskQiViewProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QiBit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      if (onQuery) {
        const res = await onQuery(query);
        setResults(res);
      } else {
        // Fallback demo mock
        setResults([
          {
            id: "bit_ask_1",
            type: "task",
            title: `Retrieved context for "${query}"`,
            body: "Found related open loop from recent captures and active projects.",
            metadata: {},
            provenance: { creator: "agent", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            memoryState: "promoted",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What should I be doing next?",
    "What am I waiting on?",
    "What changed in my active projects?",
    "What am I forgetting?",
    "Find all research notes on QiLife 2.0",
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
          Ask Qi — Open Brain Interface
        </h1>
        <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
          Natural-language retrieval across all captures, open loops, memory, and operational context.
        </p>
      </header>

      {/* Query Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything... e.g. What am I forgetting? What is blocking this project?"
          style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "1rem" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
        >
          {loading ? "Thinking..." : "Ask Qi"}
        </button>
      </form>

      {/* Sample Queries */}
      <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#6b7280", alignSelf: "center", marginRight: "0.5rem" }}>Try asking:</span>
        {sampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setQuery(q)}
            style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", padding: "0.35rem 0.75rem", borderRadius: "16px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Search Results */}
      {hasSearched && (
        <section>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            Retrieved Context ({results.length})
          </h2>
          {results.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No matching context found in Open Brain.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {results.map((bit) => (
                <div key={bit.id} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px" }}>
                      {bit.type}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                      {new Date(bit.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "#111827", marginBottom: "0.35rem" }}>{bit.title}</h3>
                  {bit.body && <p style={{ color: "#4b5563", fontSize: "0.9rem" }}>{bit.body}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
