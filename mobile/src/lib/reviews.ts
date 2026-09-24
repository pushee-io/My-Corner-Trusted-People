import { supabase } from '@/lib/supabase';

export type ReviewInput = { rating: number; title: string; body: string; recommends: boolean | null; edit?: boolean };
export type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  recommends: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  respondedAt?: string;
  canRespond: boolean;
};
export type ReviewJob = {
  providerName: string;
  providerId: string;
  completed: boolean;
  canReview: boolean;
  canEdit: boolean;
  review?: Review & { status: string };
};
export type ReviewCursor = { createdAt: string; id: string };
export type Reputation = {
  nextCursor?: ReviewCursor | null;
  average: number;
  count: number;
  completedJobs: number;
  recommendationPercent: number | null;
  reviews: Review[];
};
export type ReviewCase = {
  caseId: string;
  reviewId: string;
  reason: string;
  title: string;
  body: string;
  response?: string;
  rating: number;
  status: string;
};
export type MyReview = {
  id: string;
  jobId: string;
  providerId: string;
  title: string;
  rating: number;
  status: string;
  createdAt: string;
};

export function validateReview(input: ReviewInput) {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) return 'Choose 1–5 stars.';
  if (input.title.trim().length < 3 || input.title.trim().length > 100) return 'Use 3–100 characters for the title.';
  if (input.body.trim().length < 10 || input.body.trim().length > 2000)
    return 'Use 10–2000 characters for your review.';
  if (typeof input.recommends !== 'boolean') return 'Choose whether you would recommend this provider.';
  if (/<[^>]*>/.test(input.title + input.body)) return 'Use plain text without HTML.';
  return undefined;
}

export async function reviewApi<T>(action: string, target?: string, payload: object = {}): Promise<T> {
  const { data, error } = await supabase.rpc('review_api', { action, target: target ?? null, payload });
  if (error) {
    if (error.code === 'PGRST202' || error.message.includes('not available yet'))
      throw new Error('Reviews are not available yet.');
    throw new Error(error.message || 'Could not load reviews. Please try again.');
  }
  return data as T;
}
export const loadReviewJob = (id: string) => reviewApi<ReviewJob>('job', id);
export const verifiedReviewCount = (count: number) => `${count} verified ${count === 1 ? 'review' : 'reviews'}`;
export const loadReputation = (id: string, limit = 0, before?: ReviewCursor) =>
  reviewApi<Reputation>('provider', id, { limit, ...(before ? { before } : {}) });
export const loadMyReviews = () => reviewApi<MyReview[]>('mine');
export const loadReviewCases = () => reviewApi<ReviewCase[]>('queue');
export async function submitReview(id: string, input: ReviewInput) {
  const error = validateReview(input);
  if (error) throw new Error(error);
  return reviewApi<{ id: string; status: string }>('submit', id, {
    ...input,
    title: input.title.trim(),
    body: input.body.trim(),
  });
}
