exports.handler = async (event) => {
  const { GOOGLE_API_KEY } = process.env;
  const { folderId }       = event.queryStringParameters || {};

  if (!folderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing folderId' }) };
  }

  // Sanitize folderId — only allow alphanumeric, hyphens, underscores
  const safeFolderId = folderId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeFolderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid folderId' }) };
  }

  try {
    let pageToken = '';
    let allFiles  = [];

    do {
      const params = new URLSearchParams({
        q:         `'${safeFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
        fields:    'nextPageToken,files(id,name,mimeType)',
        pageSize:  '100',
        key:       GOOGLE_API_KEY,
        ...(pageToken ? { pageToken } : {})
      });

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      allFiles   = allFiles.concat(data.files || []);
      pageToken  = data.nextPageToken || '';

    } while (pageToken);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allFiles)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
