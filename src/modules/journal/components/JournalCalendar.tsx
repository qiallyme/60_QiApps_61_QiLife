export function JournalCalendar({
  entryDate,
  onChange,
}: {
  entryDate: string | null;
  onChange: (entryDate: string | null) => void;
}) {
  return (
    <label className="journal-calendar">
      <span className="qilife-optional">Journal date</span>
      <input
        aria-label="Filter by journal date"
        type="date"
        value={entryDate ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </label>
  );
}
