const ALLOWED_URL_PREFIXES = [
  'https://lh3.googleusercontent.com/',
  'https://drive.google.com/',
  'https://www.youtube.com/embed/',
  'https://youtube.com/embed/',
  'https://www.youtube.com/shorts/',
  'https://youtube.com/shorts/',
  'https://drive.google.com/uc?export=download',
];
 
function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return ALLOWED_URL_PREFIXES.some(prefix => url.startsWith(prefix));
}
 
function isValidItem(item) {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id   === 'string' && item.id.length > 0 &&
    typeof item.type === 'string' && ['image', 'video', 'youtube'].includes(item.type) &&
    typeof item.url  === 'string' && isSafeUrl(item.url)
  );
}
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
 
  // FIX: Authenticate the request with a shared secret token
  const authHeader = event.headers['x-admin-token'];
  if (!authHeader || authHeader !== process.env.ADMIN_SECRET_TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
 
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE } = process.env;
 
  try {
    const { items, sha } = JSON.parse(event.body || '{}');
 
    if (!Array.isArray(items)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'items must be an array' }) };
    }
 
    // FIX: Server-side validation — reject any item that fails the safety check
    const safeItems = items.filter(item => {
      if (!isValidItem(item)) {
        console.warn('Rejected invalid/unsafe item during write:', item?.id || 'unknown');
        return false;
      }
      // Cap string lengths server-side too
      item.label = (item.label || '').slice(0, 200);
      item.tag   = (item.tag   || '').slice(0, 50);
      return true;
    });
 
    const content = Buffer.from(JSON.stringify(safeItems, null, 2)).toString('base64');
    const body    = {
      message: 'Update gallery',
      content,
      ...(sha ? { sha } : {})
    };
 
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );
 
    if (!res.ok) throw new Error(await res.text());
 
    const data = await res.json();
 
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: data.content.sha })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
