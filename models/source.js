const mongoose = require('mongoose');

const energySourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        required: true,
    },
    howItWorks: {
        description: { type: String, required: true },
        diagramImage: { type: String },
    },
    advantages: [
        {
            type: String,
        },
    ],
    dailyUses: [
        {
            type: String,
        },
    ],
    rationalizationMethods: [
        {
            title: { type: String },
            description: { type: String },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('EnergySource', energySourceSchema, 'energySources');
