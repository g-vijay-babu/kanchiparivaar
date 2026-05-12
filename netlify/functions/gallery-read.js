exports.handler = async () => {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_FILE } = process.env;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    if (res.status === 404) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [], sha: null })
      };
    }

    if (!res.ok) throw new Error(`GitHub error: ${res.status}`);

    const data    = await res.json();
    const content = JSON.parse(Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sha: data.sha })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
