const mongoose = require('mongoose');
const ToolSchema = new mongoose.Schema({
  toolName: { type: String, required: true },
  confidence: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Tool', ToolSchema);