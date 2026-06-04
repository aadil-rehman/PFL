const axios    = require('axios');
const FormData = require('form-data');

const analyzeImage = async (buffer, file) => {
  const form = new FormData();
  form.append('file', buffer, {
    filename:    file.originalname,
    contentType: file.mimetype,
  });

  const { data } = await axios.post(
    `${process.env.AI_SERVICE_URL}/api/v1/detect`,
    form,
    { headers: form.getHeaders() }
  );

  return {
    isTree:     data.tree_detected,
    confidence: data.confidence,
    reason:     data.message,
  };
};

module.exports = analyzeImage;
