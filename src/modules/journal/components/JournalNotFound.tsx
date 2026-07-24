import { Link } from "react-router-dom";

export function JournalNotFound({ message }: { message?: string }) {
  return (
    <main className="qilife-page">
      <h1>Journal entry unavailable</h1>
      <p>{message || "This entry is missing or inaccessible."}</p>
      <Link to="/journal">Return to Journal</Link>
    </main>
  );
}
