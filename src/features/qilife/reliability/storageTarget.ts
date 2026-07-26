export type StorageTarget = "cloud" | "local";

interface SessionResult {
  session: { user: { id: string } } | null;
  error: Error | null;
}

export async function resolveStorageTarget({
  configured,
  explicitLocalMode,
  getSession,
}: {
  configured: boolean;
  explicitLocalMode: boolean;
  getSession: () => Promise<SessionResult>;
}): Promise<StorageTarget> {
  if (!configured || explicitLocalMode) return "local";

  const { session, error } = await getSession();
  if (error) throw error;
  if (!session?.user) {
    throw new Error("An authenticated cloud session is required. QiLife will not fall back to local storage.");
  }
  return "cloud";
}
