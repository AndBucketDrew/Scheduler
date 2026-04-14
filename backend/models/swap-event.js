import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
    fromEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Shift the requester wants to trade out
    toEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },   // Shift the requester wants to trade into
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, // Who requested the swap (being swapped out of fromEvent)
    toMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },  // Person being swapped out of toEvent
    status: {
        type: String,
        enum: ['pending_second_user', 'pending', 'approved', 'declined'],
        default: 'pending_second_user'  // Waits for toMember to accept before going to leader
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Team leader or super admin who reviews it
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);