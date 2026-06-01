import { useEffect, useState } from "react";
import { BookOpen, FileStack, FolderTree } from "lucide-react";
import { BackendUnavailableError, apiFetch } from "../api/client";
import { StateEmpty } from "./shared";

type KnowledgeCategory = {
  id: string;
  title: string;
  count?: number;
};

type Props = {
  backendStatus: "checking" | "online" | "offline";
};

const REPO_DOC_SETS = [
  "00 Overview",
  "10 Product",
  "20 Architecture",
  "30 Data Model",
  "40 UI Flows",
  "50 Modules",
  "60 AI Layer",
  "70 Deployment",
  "80 Prompts",
  "90 Decisions",
];

export function KnowledgePage({ backendStatus }: Props) {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  useEffect(() => {
    if (backendStatus !== "online") {
      setState("unavailable");
      setCategories([]);
      return;
    }

    let active = true;
    setState("loading");

    apiFetch<KnowledgeCategory[]>("/api/knowledge/categories")
      .then((data) => {
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof BackendUnavailableError) {
          setState("unavailable");
          return;
        }
        setState("unavailable");
      });

    return () => {
      active = false;
    };
  }, [backendStatus]);

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Knowledge</div>
          <h2>Docs are the source of truth.</h2>
          <p>Repo docs in `docs/` define product, architecture, data, UI flows, and decisions. The app should index them, not replace them.</p>
        </div>
      </section>

      <div className="two-col">
        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Repo Doc Sets</span>
            <span className="card-count">{REPO_DOC_SETS.length}</span>
          </div>
          <div className="stack-xs">
            {REPO_DOC_SETS.map((label) => (
              <div key={label} className="compact-row">
                <FolderTree size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card dense-card">
          <div className="card-header">
            <span className="card-title">Live Knowledge Index</span>
            <span className="card-count">{state === "ready" ? categories.length : 0}</span>
          </div>

          {state === "ready" && categories.length > 0 ? (
            <div className="stack-xs">
              {categories.map((category) => (
                <div key={category.id} className="compact-row">
                  <BookOpen size={16} />
                  <span>{category.title}</span>
                  {typeof category.count === "number" ? <span className="badge badge-bucket">{category.count}</span> : null}
                </div>
              ))}
            </div>
          ) : (
            <StateEmpty
              icon={<FileStack size={24} />}
              text={backendStatus === "offline" ? "Knowledge index requires backend docs endpoint." : "Backend docs endpoint is not available yet."}
            />
          )}
        </section>
      </div>
    </div>
  );
}
