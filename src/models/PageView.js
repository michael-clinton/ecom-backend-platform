const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
    route: { type: String, required: true },
    visitorId: { type: String, required: true },  // track visitor/session ID
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PageView', pageViewSchema);
