const raw =
  $json.response ||
  $json.output ||
  $json.text ||
  $json.data ||
  '';

function safeString(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function normalizeHashtags(value) {
  if (Array.isArray(value)) {
    return value
      .map(v => safeString(v))
      .filter(Boolean)
      .map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/^#/, '')}`);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map(v => v.trim())
      .filter(Boolean)
      .map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/^#/, '')}`);
  }

  return [];
}

function normalizePost(post) {
  return {
    platform: safeString(post.platform).toLowerCase(),
    content: safeString(post.content),
    caption: safeString(post.caption),
    hashtags: normalizeHashtags(post.hashtags),
  };
}

function isValidPost(post) {
  const allowedPlatforms = ['instagram', 'facebook', 'linkedin', 'tiktok'];
  return (
    allowedPlatforms.includes(post.platform) &&
    typeof post.content === 'string' &&
    post.content.length > 0 &&
    typeof post.caption === 'string' &&
    Array.isArray(post.hashtags)
  );
}

function tryParseJSON(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed && Array.isArray(parsed.posts)) {
      return parsed.posts.map(normalizePost).filter(isValidPost);
    }
  } catch (e) {}

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = rawText.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(sliced);
      if (parsed && Array.isArray(parsed.posts)) {
        return parsed.posts.map(normalizePost).filter(isValidPost);
      }
    } catch (e) {}
  }

  return [];
}

function tryParseTaggedBlocks(rawText) {
  const posts = [];
  const blocks = rawText.split('POST_START').map(s => s.trim()).filter(Boolean);

  for (const block of blocks) {
    const cleanBlock = block.replace(/POST_END/g, '').trim();
    const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);

    const obj = {};
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();

      if (key === 'platform') obj.platform = value;
      if (key === 'content') obj.content = value;
      if (key === 'caption') obj.caption = value;
      if (key === 'hashtags') obj.hashtags = value;
    }

    const normalized = normalizePost(obj);
    if (isValidPost(normalized)) {
      posts.push(normalized);
    }
  }

  return posts;
}

let posts = tryParseJSON(String(raw));

if (!posts.length) {
  posts = tryParseTaggedBlocks(String(raw));
}

if (!posts.length) {
  throw new Error(
    `Kein parsebares posts-Array gefunden. Raw Preview: ${String(raw).slice(0, 1000)}`
  );
}

const batchId = `n8n-${Date.now()}`;

return posts.map((post, index) => ({
  json: {
    platform: post.platform,
    content: post.content,
    caption: post.caption,
    hashtags: post.hashtags,
    post_index: index + 1,
    batch_id: batchId,
    review_status: 'pending',
    raw_preview: String(raw).slice(0, 500),
  }
}));
