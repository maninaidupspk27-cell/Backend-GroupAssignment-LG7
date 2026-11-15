const app = require('../server');
const { initDb } = require('../database/db');

let initPromise = null;

// Export as Vercel Serverless Function with safe initialization & error handling
module.exports = async (req, res) => {
  try {
    if (!initPromise) {
      initPromise = initDb();
    }
    await initPromise;
    return app(req, res);
  } catch (err) {
    console.error('Vercel serverless error:', err);
    return res.status(500).json({
      error: 'Vercel Serverless Function Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
};
