# QiLife storage and recovery

## Storage modes

QiLife always displays one persistent storage status in the application top bar:

- **Cloud** - an authenticated, owner-scoped Qi API record read or write has
  succeeded.
- **Local** - records are stored only in this browser. Local mode is explicit
  and session-scoped when cloud configuration exists.
- **Offline** - an authenticated cloud account is available, but the browser is
  currently disconnected.
- **Sync error** - synchronization could not be confirmed, or a write may not
  have reached its selected storage target.

An authenticated cloud failure does not switch QiLife to local storage. The
failed operation rejects, the status changes, and editing surfaces retain their
current in-session content according to their existing save/error behavior.
Local storage is not a cloud queue and is not synchronized later.

## Persistence paths

Authenticated mode:

```text
Module UI
  -> module repository
  -> qilifeStore
  -> Qi API with Supabase access token
  -> owner-scoped qilife.records
```

Local mode:

```text
Module UI
  -> module repository
  -> qilifeStore
  -> this browser's localStorage
```

The Qi API sets `owner_id` from the verified user token. It never trusts an
imported owner identifier. Database RLS independently restricts select, insert,
update, and delete operations to `owner_id = auth.uid()`.

## Canonical recovery export

Open the storage status indicator and choose **Export all QiLife data**. The
download is JSON with this envelope:

```json
{
  "schema": "qilife-recovery-export",
  "version": 1,
  "exported_at": "2026-07-26T12:00:00.000Z",
  "user_id": "authenticated-user-id-when-available",
  "records": []
}
```

`records` contains every active and archived QiRecord with its stable ID,
entity key, title, common fields, complete `data` object, source, creation and
update timestamps, and archive timestamp. Relationship IDs remain inside
`data`. Journal `body_markdown` and `raw_capture` are serialized without
normalization or reconstruction.

The export is a recovery snapshot. It is not encrypted. Store it according to
the sensitivity of the included records.

## Reviewed restore

1. Open the storage status indicator.
2. Choose a recovery JSON file.
3. Review total and per-entity counts plus create, update, already-current, and
   newer-existing counts.
4. Cancel without changing data, or explicitly choose **Restore reviewed
   records**.

Before preview, QiLife validates the schema version, timestamps, required record
fields, and duplicate IDs. Restore:

- creates records whose IDs are absent;
- updates only when the imported `updated_at` is newer;
- skips equal or newer existing records;
- never deletes records omitted from the file;
- preserves IDs, relationships, Journal Markdown, raw capture, and archive
  state;
- reports created, updated, skipped, and failed counts;
- can be repeated without duplicating already-restored records.

The cloud endpoint applies the same decisions while scoping every lookup and
write to the authenticated owner. A record ID collision owned by someone else
cannot be adopted or overwritten.

## Cross-device guarantee and limitations

Authenticated records confirmed as **Cloud** are read from the shared cloud
store on refresh, after reauthentication, and from another authenticated
browser. Changes become visible in another open session after that session
refreshes its data. QiLife does not yet provide real-time subscription updates
or multi-writer merge resolution.

Local records remain in one browser profile. Export and reviewed restore are the
current bridge between local and cloud workspaces; there is no background
local-first sync engine.

Until authenticated creation, reauthentication, isolated-browser retrieval,
cross-session editing, export, and restore have been manually verified with the
intended production account, use QiLife only for noncritical trial data. Do not
make it the sole record for legal deadlines, medical appointments, credentials,
financial evidence, irreplaceable evidence, or other consequential obligations.
