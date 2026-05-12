const crypto = require('crypto');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
 
  try {
    const { password } = JSON.parse(event.body || '{}');
    if (!password) {
      return { statusCode: 400, body: JSON.stringify({ valid: false }) };
    }
 
    const hash        = crypto.createHash('sha256').update(password).digest('hex');
    const storedHash  = process.env.ADMIN_PASSWORD_HASH || '';
 
    // FIX: Use timingSafeEqual to prevent timing attacks
    let valid = false;
    if (hash.length === storedHash.length) {
      valid = crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(storedHash)
      );
    }
 
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
