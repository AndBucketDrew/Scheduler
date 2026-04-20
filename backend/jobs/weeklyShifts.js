import cron from 'node-cron';
import { Event } from '../models/event.js';
import { SwapRequest } from '../models/swap-event.js';
import { Member } from '../models/member.js';
import { EventType } from '../models/event-type.js';

// Returns the Monday of the current week at midnight
function getMondayOfCurrentWeek() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1=Mon, ...
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// Shift definitions relative to Monday (dayOffset 0=Mon, 2=Wed, 4=Fri)
const SHIFT_DEFS = [
    { dayOffset: 0, startHour: 6, endHour: 14, label: 'Monday morning' },
    { dayOffset: 2, startHour: 7, endHour: 15, label: 'Wednesday morning' },
    { dayOffset: 4, startHour: 5, endHour: 13, label: 'Friday morning' },
];

export async function runWeeklyShiftJob() {
    console.log('[WeeklyJob] Starting weekly shift job...');

    const eventType = await EventType.findOne();
    if (!eventType) {
        console.warn('[WeeklyJob] No event types in DB — skipping.');
        return;
    }

    const workers = await Member.find({ role: 'worker' }).limit(4);
    if (workers.length < 2) {
        console.warn('[WeeklyJob] Need at least 2 workers — skipping.');
        return;
    }

    const monday = getMondayOfCurrentWeek();
    const createdShifts = [];

    for (let i = 0; i < SHIFT_DEFS.length; i++) {
        const def = SHIFT_DEFS[i];

        const startDate = new Date(monday);
        startDate.setDate(monday.getDate() + def.dayOffset);
        startDate.setHours(def.startHour, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setHours(def.endHour, 0, 0, 0);

        // Assign workers round-robin across shifts
        const people = [
            workers[i % workers.length]._id,
            workers[(i + 1) % workers.length]._id,
        ];

        // Look for an existing shift of this type starting within the same hour
        const windowEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
        const existing = await Event.findOne({
            type: eventType._id,
            startDate: { $gte: startDate, $lt: windowEnd },
        });

        if (existing) {
            existing.people = people;
            existing.endDate = endDate;
            await existing.save();
            createdShifts.push(existing);
            console.log(`[WeeklyJob] Updated shift: ${def.label}`);
        } else {
            const shift = await Event.create({
                type: eventType._id,
                location: 'Main Office',
                people,
                startDate,
                endDate,
            });
            createdShifts.push(shift);
            console.log(`[WeeklyJob] Created shift: ${def.label}`);
        }
    }

    // Create a swap request between shift[0] and shift[1] for admin review.
    // Status is set to 'pending' directly so the admin sees it without a worker having to initiate it.
    const fromShift = createdShifts[0];
    const toShift = createdShifts[1];
    const requester = workers[0];
    const toMember = workers[1 % workers.length];

    if (requester._id.toString() === toMember._id.toString()) {
        console.warn('[WeeklyJob] Requester and toMember are the same — skipping swap request.');
        return;
    }

    const swapRequest = await SwapRequest.create({
        fromEvent: fromShift._id,
        toEvent: toShift._id,
        requester: requester._id,
        toMember: toMember._id,
        status: 'pending',
    });

    console.log(`[WeeklyJob] Swap request created (${swapRequest._id}) — awaiting admin review.`);
}

// Runs every Monday at 00:00. Change the timezone to match your location.
export function scheduleWeeklyShiftJob() {
    cron.schedule('0 0 * * 1', runWeeklyShiftJob, { timezone: 'Europe/Belgrade' });
    console.log('[WeeklyJob] Scheduled — fires every Monday at 00:00 (Europe/Belgrade).');
}
