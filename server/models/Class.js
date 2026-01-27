// Class model removed — video classes feature deprecated.
// Export a minimal placeholder to avoid runtime import errors.
const mongoose = require('mongoose');
const PlaceholderSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model('Class', PlaceholderSchema);
