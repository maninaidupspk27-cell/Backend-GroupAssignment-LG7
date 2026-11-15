let app;
let loadError = null;

try {
  app = require('../server');
} catch (err) {
  loadError = err;
  console.error('Failed to load server module:', err);
}

module.exports = async (req, res) => {
  if (loadError) {
    return res.status(500).json({
      error: 'Module Load Error on Vercel',
      message: loadError.message,
      stack: loadError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Runtime Error on Vercel',
      message: err.message,
      stack: err.stack
    });
  }
};
