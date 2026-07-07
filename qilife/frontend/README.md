# QiLife v1 (Mock Vertical Slice)

This is a mocked vertical slice of the QiLife frontend demonstrating the core conceptual loop:

**Capture → Agent Draft → Review → Timeline**

### What this is:
- **Local-first**: Uses `localStorage` to keep your pending drafts and timeline entries around during page reloads.
- **Mocked "AI" Agent**: Contains a small rule-based engine in `mock-agent.ts` to pretend it is an LLM reading your captures. Keywords like "doctor", "payment", or "todo" will correctly categorize the draft.
- **Frontend only**: Focuses entirely on UI and flow.

### What comes later (Phase 2+):
- Real backend API ingestion
- Real database (Supabase/PostgreSQL)
- File hashing and blob storage
- Real AI LLM endpoints for drafting and agentic actions
- Authentication and real-time syncing

## Production Preview Test

To verify the production build locally:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build the application**:
   ```bash
   pnpm run build
   ```

3. **Preview the production build**:
   ```bash
   pnpm run preview
   ```
   Open the preview URL (usually `http://127.0.0.1:4173/`) in your browser to verify functionality, layout, and mobile responsiveness.
