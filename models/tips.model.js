const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    image: {
        type: String,
    },
    fullDescription: {
        type: String,
    },
    sections: [
        {
            subtitle: [String],
            paragraphs: [String],
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model('Tip', tipSchema);
