// AI image analysis is disabled for now. To re-enable, uncomment the
// analyzeImage import and the line below — submitPlant already reads
// req.aiResult (falling back to isTree: true when it's absent).
// const analyzeImage = require('./analyzeImage');

const imageAnalysisMiddleware = async (req, res, next) => {
  try {
    if (!req.file) return next();
    // req.aiResult = await analyzeImage(req.file.buffer, req.file);
    next();
  } catch (err) {
    console.error('AI analysis error:', err.message);
    return res.status(502).json({ message: 'Image analysis service unavailable' });
  }
};

module.exports = imageAnalysisMiddleware;
