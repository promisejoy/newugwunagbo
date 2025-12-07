const mongoose = require('mongoose');

const leadershipHistorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Leader name is required'],
        trim: true
    },
    village: {
        type: String,
        required: [true, 'Village name is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    period: {
        type: String,
        required: [true, 'Period is required'],
        trim: true
    },
    achievements: {
        type: String,
        trim: true
    },
    
    image: {
        type: String,
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeadershipHistory', leadershipHistorySchema);