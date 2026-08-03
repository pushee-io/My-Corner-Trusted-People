alter type public.event_status add value if not exists 'archived';
alter type public.event_visibility add value if not exists 'invite_only';
alter type public.event_moderation_status add value if not exists 'rejected';
