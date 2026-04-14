select id, platform, caption, hashtags, review_status, batch_id, created_at
from generated_social_posts
order by id desc
limit 10;
