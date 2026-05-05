
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.write_audit() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
-- has_role must remain callable by signed-in users for RLS evaluation
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
