import React, { useId } from "react";
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
  const fieldId = useId();
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
      <div className="people-panel-header">
        <h4>Contact Methods</h4>
        {!readOnly && (
          <button
            type="button"
            className="qilife-mini-btn"
            onClick={handleAdd}
          >
            + Add Method
          </button>
        )}
      </div>

      {methods.length === 0 ? (
        <div className="qilife-empty-state compact">
          No contact methods recorded.
        </div>
      ) : (
        <div className="people-panel-list">
          {methods.map((cm) => (
            <div
              key={cm.id}
              className={`people-contact-row ${readOnly ? "read-only" : ""}`}
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
                    id={`${fieldId}-${cm.id}-kind`}
                    name={`contactMethod-${cm.id}-kind`}
                    aria-label={`${cm.label || "Contact method"} type`}
                    value={cm.kind}
                    onChange={(e) => handleUpdate(cm.id, { kind: e.target.value as ContactMethodKind })}
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
                    id={`${fieldId}-${cm.id}-value`}
                    name={`contactMethod-${cm.id}-value`}
                    aria-label={`${cm.label || "Contact method"} value`}
                    type="text"
                    placeholder="Value (email, phone number, handle)..."
                    value={cm.value}
                    onChange={(e) => handleUpdate(cm.id, { value: e.target.value })}
                  />

                  <label className="qilife-check-label" htmlFor={`${fieldId}-${cm.id}-primary`}>
                    <input
                      id={`${fieldId}-${cm.id}-primary`}
                      name={`contactMethod-${cm.id}-primary`}
                      type="checkbox"
                      checked={cm.isPrimary}
                      onChange={(e) => handleUpdate(cm.id, { isPrimary: e.target.checked })}
                    />
                    Primary
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemove(cm.id)}
                    className="qilife-icon-btn danger"
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
