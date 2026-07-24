import React from "react";
import type { ContactMethod, ContactMethodKind } from "../types";

interface ContactMethodsPanelProps {
  methods: ContactMethod[];
  onChange?: (methods: ContactMethod[]) => void;
  readOnly?: boolean;
}

export const ContactMethodsPanel: React.FC<ContactMethodsPanelProps> = ({
  methods,
  onChange,
  readOnly = false,
}) => {
  const handleAdd = () => {
    if (readOnly || !onChange) return;
    const newMethod: ContactMethod = {
      id: `cm-${Date.now()}`,
      kind: "email",
      label: "Email",
      value: "",
      isPrimary: methods.length === 0,
    };
    onChange([...methods, newMethod]);
  };

  const handleRemove = (id: string) => {
    if (readOnly || !onChange) return;
    onChange(methods.filter((m) => m.id !== id));
  };

  const handleUpdate = (id: string, patch: Partial<ContactMethod>) => {
    if (readOnly || !onChange) return;
    onChange(
      methods.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const formatKindLabel = (kind: ContactMethodKind) => {
    return kind.replace("_", " ").toUpperCase();
  };

  return (
    <div className="qilife-card people-contact-methods">
      <div className="people-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", letterSpacing: "-0.01em" }}>Contact Methods</h4>
        {!readOnly && (
          <button
            type="button"
            className="qilife-mini-btn"
            onClick={handleAdd}
            style={{ fontSize: "11px", padding: "4px 8px" }}
          >
            + Add Method
          </button>
        )}
      </div>

      {methods.length === 0 ? (
        <div style={{ color: "var(--qi-faint, #666)", fontSize: "12px", fontStyle: "italic" }}>
          No contact methods recorded.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {methods.map((cm) => (
            <div
              key={cm.id}
              style={{
                display: "grid",
                gridTemplateColumns: readOnly ? "110px 1fr auto" : "110px 1fr 100px auto",
                gap: "8px",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid var(--qi-border, rgba(255, 255, 255, 0.08))",
              }}
            >
              {readOnly ? (
                <>
                  <span style={{ fontSize: "11px", color: "var(--qi-muted, #888)", fontWeight: 600 }}>
                    {cm.label || formatKindLabel(cm.kind)}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--qi-text, #fff)", wordBreak: "break-all" }}>
                    {cm.value}
                  </span>
                  {cm.isPrimary && (
                    <span style={{ fontSize: "10px", background: "rgba(192, 132, 252, 0.15)", color: "#c084fc", padding: "2px 6px", borderRadius: "4px" }}>
                      PRIMARY
                    </span>
                  )}
                </>
              ) : (
                <>
                  <select
                    value={cm.kind}
                    onChange={(e) => handleUpdate(cm.id, { kind: e.target.value as ContactMethodKind })}
                    style={{ background: "#11101a", color: "#fff", border: "1px solid #333", borderRadius: "4px", padding: "4px 6px", fontSize: "11px" }}
                  >
                    <option value="email">Email</option>
                    <option value="mobile_phone">Mobile Phone</option>
                    <option value="home_phone">Home Phone</option>
                    <option value="work_phone">Work Phone</option>
                    <option value="address">Address</option>
                    <option value="website">Website</option>
                    <option value="social_profile">Social Profile</option>
                    <option value="messaging_handle">Messaging</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Value (email, phone number, handle)..."
                    value={cm.value}
                    onChange={(e) => handleUpdate(cm.id, { value: e.target.value })}
                    style={{ background: "#11101a", color: "#fff", border: "1px solid #333", borderRadius: "4px", padding: "4px 8px", fontSize: "12px" }}
                  />

                  <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#aaa", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={cm.isPrimary}
                      onChange={(e) => handleUpdate(cm.id, { isPrimary: e.target.checked })}
                    />
                    Primary
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemove(cm.id)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
