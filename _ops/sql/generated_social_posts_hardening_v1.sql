alter table generated_social_posts
alter column review_status set default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'generated_social_posts_platform_check'
  ) then
    alter table generated_social_posts
    add constraint generated_social_posts_platform_check
    check (platform in ('instagram', 'facebook', 'linkedin', 'tiktok'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'generated_social_posts_review_status_check'
  ) then
    alter table generated_social_posts
    add constraint generated_social_posts_review_status_check
    check (review_status in ('pending', 'approved', 'rejected', 'scheduled', 'published'));
  end if;
end
$$;
