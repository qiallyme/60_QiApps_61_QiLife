import React, { useEffect, useState } from "react";
import { fetchFullWorkbenchData } from "../data/entityQueries";
import { WorkbenchEntity, WorkbenchRelationship } from "../data/entityTypes";

export function AlphaWorkbenchPage() {
  const [entities, setEntities] = useState<WorkbenchEntity[]>([]);
  const [relationships, setRelationships] = useState<WorkbenchRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    fetchFullWorkbenchData()
      .then((data) => {
        setEntities(data.entities);
        setRelationships(data.relationships);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load workbench data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "var(--text-muted, #a0aec0)" }}>
        <div className="flex items-center gap-2">
          <span>Loading QiLife Workbench...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "var(--text-error, #f56565)" }}>
        <h2>Error Loading Workbench</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Counts by type
  const counts = entities.reduce((acc, ent) => {
    acc[ent.type] = (acc[ent.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const people = entities.filter((e) => e.type === "person" || e.type === "company");
  const threads = entities.filter((e) => e.type === "thread");
  const tasks = entities.filter((e) => e.type === "action" || e.type === "qibit");

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #2d3748", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#e2e8f0" }}>QiLife Workbench Alpha</h1>
            <p style={{ margin: "0.25rem 0 0", color: "#a0aec0", fontSize: "0.9rem" }}>
              Read-Only Prototype Surface • Supabase Integration
            </p>
          </div>
          <span style={{
            background: "rgba(102, 126, 234, 0.15)",
            color: "#667eea",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            border: "1px solid rgba(102, 126, 234, 0.3)"
          }}>
            ALPHA
          </span>
        </div>
      </header>

      {/* Navigation tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #1a202c" }}>
        {["dashboard", "people", "projects", "tasks", "relationships"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.75rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #667eea" : "2px solid transparent",
              color: activeTab === tab ? "#e2e8f0" : "#718096",
              cursor: "pointer",
              fontWeight: activeTab === tab ? "bold" : "normal",
              textTransform: "capitalize",
              fontSize: "0.95rem"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem"
          }}>
            {/* Stat Cards */}
            <div style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid #48bb78" }}>
              <div style={{ fontSize: "0.85rem", color: "#718096", textTransform: "uppercase" }}>Total Entities</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e2e8f0", margin: "0.25rem 0" }}>{entities.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#a0aec0" }}>Seeded mock rows in Supabase</div>
            </div>

            <div style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid #4299e1" }}>
              <div style={{ fontSize: "0.85rem", color: "#718096", textTransform: "uppercase" }}>People & Orgs</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e2e8f0", margin: "0.25rem 0" }}>{people.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#a0aec0" }}>Contacts, Companies</div>
            </div>

            <div style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid #ed8936" }}>
              <div style={{ fontSize: "0.85rem", color: "#718096", textTransform: "uppercase" }}>Projects & Matters</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e2e8f0", margin: "0.25rem 0" }}>{threads.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#a0aec0" }}>Active execution threads</div>
            </div>

            <div style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid #9f7aea" }}>
              <div style={{ fontSize: "0.85rem", color: "#718096", textTransform: "uppercase" }}>Tasks & Care Items</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#e2e8f0", margin: "0.25rem 0" }}>{tasks.length}</div>
              <div style={{ fontSize: "0.8rem", color: "#a0aec0" }}>Actions, QiBits, reminders</div>
            </div>
          </div>

          <section style={{ background: "#1a202c", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem", color: "#e2e8f0" }}>Entities Inventory By Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {Object.entries(counts).map(([type, count]) => (
                <div key={type} style={{ background: "#2d3748", padding: "0.75rem 1rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a0aec0", textTransform: "capitalize", fontSize: "0.9rem" }}>{type}</span>
                  <span style={{ color: "#e2e8f0", fontWeight: "bold" }}>{count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* People & Orgs List */}
      {activeTab === "people" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {people.map((p) => (
            <div key={p.id} style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", border: "1px solid #2d3748" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, color: "#e2e8f0" }}>{p.title}</h3>
                <span style={{
                  fontSize: "0.75rem",
                  background: p.type === "company" ? "#3182ce" : "#4a5568",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  color: "#fff",
                  textTransform: "uppercase"
                }}>
                  {p.type}
                </span>
              </div>
              <div style={{ color: "#a0aec0", fontSize: "0.9rem", display: "grid", gap: "0.25rem" }}>
                <div><strong>Relationship:</strong> {p.metadata_json.relationship || p.metadata_json.industry || "N/A"}</div>
                {p.metadata_json.email && <div><strong>Email:</strong> {p.metadata_json.email}</div>}
                {p.metadata_json.phone && <div><strong>Phone:</strong> {p.metadata_json.phone}</div>}
                {p.metadata_json.notes && <div style={{ marginTop: "0.5rem", color: "#cbd5e0", fontStyle: "italic" }}>"{p.metadata_json.notes}"</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects & Threads List */}
      {activeTab === "projects" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {threads.map((t) => (
            <div key={t.id} style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", border: "1px solid #2d3748" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, color: "#e2e8f0" }}>{t.title}</h3>
                <span style={{
                  fontSize: "0.75rem",
                  background: t.status === "active" ? "#48bb78" : "#d69e2e",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  color: "#1a202c",
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  {t.status}
                </span>
              </div>
              <p style={{ color: "#cbd5e0", margin: "0.5rem 0 1rem", fontSize: "0.95rem" }}>
                {t.metadata_json.description}
              </p>
              <div style={{ color: "#a0aec0", fontSize: "0.85rem", display: "flex", gap: "1.5rem" }}>
                <div><strong>Priority:</strong> {t.metadata_json.priority || "Normal"}</div>
                <div><strong>Bucket:</strong> {t.metadata_json.bucket_code}</div>
                {t.metadata_json.due_date && <div><strong>Due Date:</strong> {t.metadata_json.due_date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks & Action Items */}
      {activeTab === "tasks" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ background: "#1a202c", padding: "1.25rem", borderRadius: "8px", border: "1px solid #2d3748" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.1rem" }}>{task.title}</h4>
                <span style={{
                  fontSize: "0.75rem",
                  background: task.type === "qibit" ? "#9f7aea" : "#718096",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  color: "#fff",
                  textTransform: "uppercase"
                }}>
                  {task.type}
                </span>
              </div>
              {task.metadata_json.raw_capture && (
                <p style={{ color: "#cbd5e0", margin: "0.5rem 0", fontStyle: "italic" }}>
                  "{task.metadata_json.raw_capture}"
                </p>
              )}
              <div style={{ color: "#a0aec0", fontSize: "0.85rem", display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                <div><strong>Status:</strong> {task.status}</div>
                <div><strong>Priority:</strong> {task.metadata_json.priority || "medium"}</div>
                {task.metadata_json.due_date && <div><strong>Due Date:</strong> {task.metadata_json.due_date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entity Relationships */}
      {activeTab === "relationships" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {relationships.map((rel) => (
            <div key={rel.id} style={{ background: "#1a202c", padding: "1rem", borderRadius: "8px", border: "1px solid #2d3748", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#a0aec0", fontSize: "0.8rem", textTransform: "uppercase" }}>Source Entity</span>
                <div style={{ color: "#e2e8f0", fontWeight: "bold" }}>{rel.source_entity?.title || "Unknown"}</div>
                <div style={{ color: "#718096", fontSize: "0.75rem" }}>{rel.source_entity?.type}</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "0 1rem" }}>
                <div style={{
                  fontSize: "0.75rem",
                  color: "#667eea",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  background: "rgba(102, 126, 234, 0.1)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  display: "inline-block"
                }}>
                  {rel.relationship_type}
                </div>
                <div style={{ color: "#4a5568", fontSize: "1.2rem", marginTop: "0.25rem" }}>➔</div>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <span style={{ color: "#a0aec0", fontSize: "0.8rem", textTransform: "uppercase" }}>Target Entity</span>
                <div style={{ color: "#e2e8f0", fontWeight: "bold" }}>{rel.target_entity?.title || "Unknown"}</div>
                <div style={{ color: "#718096", fontSize: "0.75rem" }}>{rel.target_entity?.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default AlphaWorkbenchPage;
