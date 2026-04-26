const analyzeImage = require('./analyzeImage');

/**
 * Middleware: runs AI image analysis before submitPlant.
 * Attaches req.aiResult = { isTree, confidence, reason } for the controller to consume.
 *
 * BYPASS is active until AI is integrated — remove the bypass block below
 * and uncomment the production block when the AI module is ready.
 */
const imageAnalysisMiddleware = async (req, res, next) => {
  // ─── BYPASS (remove once AI is ready) ────────────────────────────
  req.aiResult = { isTree: true, confidence: 1.0, reason: null };
  return next();
  // ─────────────────────────────────────────────────────────────────

  // ─── TODO: uncomment when AI is ready ────────────────────────────
  // try {
  //   const { photoUrl } = req.body;
  //   if (!photoUrl) return next(); // missing photoUrl handled in controller
  //   req.aiResult = await analyzeImage(photoUrl);
  //   next();
  // } catch (err) {
  //   console.error('AI analysis error:', err);
  //   return res.status(502).json({ message: 'Image analysis service unavailable' });
  // }
};

module.exports = imageAnalysisMiddleware;
