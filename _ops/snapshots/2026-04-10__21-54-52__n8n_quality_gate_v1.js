const allowedPlatforms = ['instagram', 'facebook', 'linkedin', 'tiktok'];

function safeString(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

return items
  .map(item => {
    const post = item.json;

    return {
      json: {
        ...post,
        platform: safeString(post.platform).toLowerCase(),
        content: safeString(post.content),
        caption: safeString(post.caption),
        hashtags: Array.isArray(post.hashtags)
          ? post.hashtags.map(v => safeString(v)).filter(Boolean)
          : [],
      }
    };
  })
  .filter(item => {
    const p = item.json;
    return (
      allowedPlatforms.includes(p.platform) &&
      p.content.length >= 40 &&
      p.caption.length >= 20 &&
      Array.isArray(p.hashtags) &&
      p.hashtags.length >= 2
    );
  });
