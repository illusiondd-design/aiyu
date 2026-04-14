select
  id,
  platform,
  caption,
  hashtags,
  batch_id,
  review_status,
  created_at
from generated_social_posts
where review_status = 'pending'
order by created_at desc
limit 50;
