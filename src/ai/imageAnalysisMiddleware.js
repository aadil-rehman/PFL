const analyzeImage = require('./analyzeImage');

const imageAnalysisMiddleware = async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.aiResult = await analyzeImage(req.file.buffer, req.file);
    console.log('AI analysis result:', req.aiResult);
    next();
  } catch (err) {
    console.error('AI analysis error:', err.message);
    return res.status(502).json({ message: 'Image analysis service unavailable' });
  }
};

module.exports = imageAnalysisMiddleware;
