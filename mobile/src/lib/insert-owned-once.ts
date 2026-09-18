import { supabase } from '@/lib/supabase';

/** Reconcile an acknowledged or lost INSERT response without enabling upsert. */
export async function insertOwnedOnce<T>(
  table: string,
  values: Record<string, unknown>,
  columns: string,
  ownerColumn: string,
  ownerId: string,
  clientId?: string,
): Promise<{ row: T; reused: boolean }> {
  async function existing() {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('id', clientId!)
      .eq(ownerColumn, ownerId)
      .maybeSingle();
    if (error) throw error;
    return data as T | null;
  }
  if (clientId) {
    const row = await existing();
    if (row) return { row, reused: true };
  }
  const { data, error } = await supabase
    .from(table)
    .insert({ ...values, ...(clientId ? { id: clientId } : {}) })
    .select(columns)
    .single();
  if (error) {
    if (clientId && error.code === '23505') {
      const row = await existing();
      if (row) return { row, reused: true };
    }
    throw error;
  }
  return { row: data as T, reused: false };
}
