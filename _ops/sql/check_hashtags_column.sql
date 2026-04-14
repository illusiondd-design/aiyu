select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'generated_social_posts'
and column_name = 'hashtags';
