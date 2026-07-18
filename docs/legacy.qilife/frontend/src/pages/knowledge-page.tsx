import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileSearch, FileStack, FolderTree, Search } from "lucide-react";
import { BackendUnavailableError, getKnowledgeDoc, listKnowledgeDocs, searchKnowledgeDocs } from "../api/client";
import type { KnowledgeCategory, KnowledgeDoc } from "../types";
import { StateEmpty } from "./shared";

type Props = {
  backendStatus: "checking" | "online" | "offline";
};

export function KnowledgePage({ backendStatus }: Props) {
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [results, setResults] = useState<KnowledgeDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  useEffect(() => {
    if (backendStatus !== "online") {
      setState("unavailable");
      setCategories([]);
      setResults([]);
      setSelectedDoc(null);
      return;
    }

    let active = true;
    setState("loading");

    listKnowledgeDocs()
      .then((data) => {
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
        setResults([]);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.warn("Knowledge docs list unavailable.", error);
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

  const totalDocs = useMemo(
    () => categories.reduce((sum, category) => sum + (category.count ?? category.docs.length ?? 0), 0),
    [categories],
  );

  async function openDoc(docId: string) {
    try {
      const doc = await getKnowledgeDoc(docId);
      setSelectedDoc(doc);
    } catch (error) {
      console.warn("Knowledge doc load unavailable.", error);
      setSelectedDoc(null);
    }
  }

  async function handleSearch(nextQuery: string) {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      const matches = await searchKnowledgeDocs(nextQuery.trim());
      setResults(matches);
    } catch (error) {
      console.warn("Knowledge search unavailable.", error);
      setResults([]);
    }
  }

  return (
    <div className="page-stack">
      <section className="desk-banner">
        <div>
          <div className="section-tag subdued">Knowledge</div>
          <h2>Docs are the source of truth.</h2>
          <p>QiLife reads from the configured docs root so product, architecture, and deployment knowledge stay tied to the active stack.</p>
        </div>
      </section>

      <section className="card dense-card stack-md">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              value={query}
              onChange={(event) => void handleSearch(event.target.value)}
              placeholder="Search docs by filename, path, or content"
            />
          </div>
          <span className="card-count">{totalDocs}</span>
        </div>
      </section>

      <div className="two-col detail-grid">
        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Knowledge Index</span>
            <span className="card-count">{categories.length}</span>
          </div>

          {state === "ready" && query.trim() && results.length > 0 ? (
            <div className="stack-sm">
              {results.map((doc) => (
                <button key={doc.id} type="button" className="record-link-card button-reset" onClick={() => void openDoc(doc.id)}>
                  <div className="compact-row spread">
                    <strong>{doc.title}</strong>
                    <span className="badge badge-bucket">{doc.group}</span>
                  </div>
                  <div className="compact-text">{doc.relativePath}</div>
                  {doc.excerpt ? <div className="compact-text">{doc.excerpt}</div> : null}
                </button>
              ))}
            </div>
          ) : state === "ready" && categories.length > 0 ? (
            <div className="stack-sm">
              {categories.map((category) => (
                <div key={category.id} className="stack-xs">
                  <div className="compact-row">
                    <FolderTree size={16} />
                    <strong>{category.title}</strong>
                    <span className="badge badge-bucket">{category.count}</span>
                  </div>
                  <div className="stack-xs">
                    {category.docs.map((doc) => (
                      <button key={doc.id} type="button" className="record-link-card button-reset" onClick={() => void openDoc(doc.id)}>
                        <div className="compact-row spread">
                          <span>{doc.title}</span>
                          <BookOpen size={14} />
                        </div>
                        <div className="compact-text">{doc.relativePath}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StateEmpty
              icon={<FileSearch size={24} />}
              text={backendStatus === "offline" ? "Knowledge index requires backend docs endpoint." : "Backend docs endpoint is not available yet."}
            />
          )}
        </section>

        <section className="card dense-card stack-md">
          <div className="card-header">
            <span className="card-title">Document View</span>
            <span className="card-count">{selectedDoc ? selectedDoc.group : "docs"}</span>
          </div>

          {selectedDoc ? (
            <div className="stack-sm">
              <div className="stack-xs">
                <strong>{selectedDoc.title}</strong>
                <span className="compact-text">{selectedDoc.relativePath}</span>
              </div>
              <div className="raw-panel knowledge-doc-panel">{selectedDoc.content ?? "Document content unavailable."}</div>
            </div>
          ) : (
            <StateEmpty
              icon={<FileStack size={24} />}
              text={backendStatus === "offline" ? "Knowledge index requires backend docs endpoint." : "Select a document to view its contents."}
            />
          )}
        </section>
      </div>
    </div>
  );
}
