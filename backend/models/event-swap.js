import mongoose from "mongoose";

const eventSwapSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'Member', required: true },
    targetUser: { type: mongoose.Types.ObjectId, ref: 'Member', required: true },
    event: { type: mongoose.Types.ObjectId, ref: 'Event', required: true },
    targetEvent: { type: mongoose.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
    reason: { type: String }
});

export const EventSwap = mongoose.model('EventSwap', eventSwapSchema);