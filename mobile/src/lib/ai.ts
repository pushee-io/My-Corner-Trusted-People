import { featureFlags } from '@/lib/feature-flags';
import { supabase } from '@/lib/supabase';
import type { RequestUrgency } from '@/types/contracts';
export type RequestSuggestion = {
  title: string;
  description: string;
  urgency: RequestUrgency;
  missingInfo: string[];
  safetyWarning: string;
};
export async function structureServiceRequest(input: string): Promise<RequestSuggestion> {
  if (!featureFlags.ai_service_request_structurer)
    throw new Error('AI structuring is currently unavailable. You can complete your request manually.');
  if (input.trim().length < 5 || input.trim().length > 3000)
    throw new Error('Enter between 5 and 3000 characters to structure.');
  const { data, error } = await supabase.functions.invoke('structure-service-request', { body: { text: input } });
  if (
    error ||
    !data?.enabled ||
    typeof data.result?.title !== 'string' ||
    typeof data.result?.description !== 'string'
  ) {
    throw new Error('AI structuring is unavailable. Your draft is unchanged; please continue manually.');
  }
  return data.result as RequestSuggestion;
}
