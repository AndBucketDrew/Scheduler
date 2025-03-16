import mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, required: false },
    color: { type: String, required: true }
});

export const EventType = mongoose.model('EventType', eventTypeSchema);