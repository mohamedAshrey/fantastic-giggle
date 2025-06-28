const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },
});

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    shortDescription: {
        type: String,
        required: true,
    },

    image: {
        type: String,
        required: true,
    },

    date: {
        type: Date,
        default: Date.now,
    },

    author: {
        type: String,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    sections: [sectionSchema],
});

module.exports = mongoose.model('Blog', blogSchema);
