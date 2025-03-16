import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
    description: { type: String, required: false },
    location: { type: String, required: true },
    people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
});

export const Event = mongoose.model('Event', eventSchema);