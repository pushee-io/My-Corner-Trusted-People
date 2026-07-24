revoke select on public.job_requests from authenticated;

grant select (
  id,
  requester_id,
  provider_id,
  category_id,
  title,
  description,
  original_user_text,
  urgency,
  preferred_date,
  preferred_time,
  contact_preference,
  neighborhood_id,
  general_area_label,
  status,
  moderation_status,
  created_at,
  updated_at
) on public.job_requests to authenticated;

grant insert (
  requester_id,
  provider_id,
  category_id,
  title,
  description,
  original_user_text,
  urgency,
  preferred_date,
  preferred_time,
  contact_preference,
  neighborhood_id,
  general_area_label,
  exact_address_private,
  status,
  moderation_status
) on public.job_requests to authenticated;

revoke update on public.job_requests from authenticated;
grant update (status) on public.job_requests to authenticated;
