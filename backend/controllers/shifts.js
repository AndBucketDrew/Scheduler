import { EventType } from "../models/event-type.js";
import { Event } from "../models/event.js";
import { SwapRequest } from "../models/swap-event.js";
import { Member } from "../models/member.js"
import { Roles } from "../config/roles.js";
import { validationResult, matchedData } from 'express-validator';
import HttpError from "../models/http-error.js";
import mongoose from 'mongoose';

// Retrieves all shifts from the database
const getAllEvents = async (req, res, next) => {
    try {
        const shifts = await Event.find().populate('type');
        res.json(shifts);
    } catch (err) {
        return next(new HttpError("Something went wrong, please try again.", err, 500));
    }
};

// Fetches a single event by ID
const getOneEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('type');
        if (!event) {
            return next(new HttpError("Shift not found.", null, 404));
        }
        res.json(event);
    } catch (err) {
        return next(new HttpError("Something went wrong, please try again.", err, 500));
    }
}

// Creates a new shift/event with transaction support
const createEvent = async (req, res, next) => {
    try {
        const { type, people, startDate, endDate, location } = req.body;

        const eventType = await EventType.findById(type);
        if (!eventType) {
            return res.status(400).json({ message: 'Event type not found' });
        }

        // Handle people field: convert string to array if necessary
        let peopleArray = [];
        if (people && typeof people === 'string') {
            peopleArray = people.split(',').map(id => id.trim());
        }

        console.log("Processed people array:", peopleArray);

        const session = await mongoose.startSession();
        session.startTransaction();

        const newEvent = new Event({
            type,
            people: peopleArray,
            startDate,
            endDate,
            location
        });

        await newEvent.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.json(newEvent);

    } catch (err) {
        console.error("Error creating shift:", err);
        return next(new HttpError("Something went wrong, please try again.", 500));
    }
};

// Updates an existing event
const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = validationResult(req);
        if (result.errors.length > 0) {
            throw new HttpError(JSON.stringify(result.errors), 422);
        }

        const data = matchedData(req);
        const targetEvent = await Event.findById(id);

        if (!targetEvent) {
            throw new HttpError('Event cannot be found', 404);
        }

        // Process people field if provided
        if (data.people) {
            let peopleArray = [];
            if (typeof data.people === 'string') {
                peopleArray = data.people.split(',').map(id => id.trim());
            }
            data.people = peopleArray;
        }
        console.log('Data People', data.people)

        Object.assign(targetEvent, data);
        const updatedEvent = await targetEvent.save();
        res.json(updatedEvent);
    } catch (err) {
        return next(new HttpError(err, err.errorCode || 500));
    }
};

// Updates an event type with transaction support
const updateEventType = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, icon, color } = req.body;
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      const updatedEventType = await EventType.findByIdAndUpdate(
        id,
        { name, icon, color },
        { new: true, session }
      );
  
      if (!updatedEventType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'EventType not found' });
      }
  
      await session.commitTransaction();
      session.endSession();
  
      res.json(updatedEventType);
    } catch (error) {
      console.error('Error updating event type:', error);
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      res.status(500).json({ message: 'Failed to update EventType' });
    }
};

// Creates a new event type with transaction support
const createEventType = async (req, res, next) => {
    try {
        const { name, icon, color } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const newEventType = new EventType({
            name,
            icon,
            color,
        });

        await newEventType.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json(newEventType);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create EventType' });
    }
};

// Retrieves all event types
const getAllEventTypes = async (req, res, next) => {
    try {
        const eventType = await EventType.find();
        res.json(eventType);
    } catch (err) {
        return next(new HttpError("Something went wrong, please try again.", 500));
    }
};

// Deletes an event type by ID and all associated events/shifts to avoid app crash
//TODO in future: Update delete handling so that asssociated event/shifts don't get deleted
const deleteEventType = async (req, res, next) => {
    try {
        const eventTypeId = req.params.id;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const targetEventType = await EventType.findByIdAndDelete({ _id: eventTypeId }).session(session);

            if (!targetEventType) {
                throw new HttpError('EventType not Found', 404);
            }

            // Delete all events/shifts associated with this event type
            const deleteResult = await Event.deleteMany({ type: eventTypeId }).session(session);

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            res.send({
                message: 'EventType and associated shifts deleted successfully',
                deletedEventCount: deleteResult.deletedCount
            });
        } catch (error) {
            // If an error occurs, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error; // Re-throw to be caught by the outer catch block
        }
    } catch (error) {
        return next(new HttpError(error.message || error, error.errorCode || 500));
    }
};

// Deletes a shift by ID
const deleteEvent = async (req, res, next) => {
    try {
        const targetShift = await Event.findByIdAndDelete({ _id: req.params.id });

        if (!targetShift) {
            throw new HttpError('User not Found', 404);
        }

        res.send('Shift deleted successfully')
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

// Fetches all events for a specific user
const getUserEvents = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const userShifts = await Event.find({ people: userId }).populate('type');

        if (userShifts.length === 0) {
            return res.status(404).json({ message: 'No shifts found for this user.' });
        }

        res.json(userShifts || []);
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

// Requests a swap between two events
const requestEventSwap = async (req, res, next) => {
    try {
        const { fromEventId, toEventId, toMemberId } = req.body;
        const userId = req.params.id; // Requester ID

        console.log('Request body:', { fromEventId, toEventId, toMemberId });
        console.log('Requester ID (userId):', userId);

        // Input validation
        if (!fromEventId || !toEventId || !toMemberId) {
            return next(new HttpError('From Event ID, To Event ID, and toMember ID are required', 400));
        }

        // Verify both events exist
        const fromEvent = await Event.findById(fromEventId).populate('people');
        if (!fromEvent) {
            return next(new HttpError('From event not found', null, 404));
        }
        const toEvent = await Event.findById(toEventId).populate('people');
        if (!toEvent) {
            return next(new HttpError('To event not found', null, 404));
        }

        // Check if requester is assigned to event/shift (true/false)
        const requesterExists = fromEvent.people.some(member => member._id.toString() === userId);
        if (!requesterExists) {
            return next(new HttpError('You are not assigned to the fromEvent', null, 400));
        }

        // Validate toMember
        const toMember = await Member.findById(toMemberId);
        if (!toMember) {
            return next(new HttpError('The member to swap with does not exist', null, 404));
        }
        const toMemberExists = toEvent.people.some(member => member._id.toString() === toMemberId);
        if (!toMemberExists) {
            return next(new HttpError('The member to swap with is not assigned to the toEvent', null, 400));
        }

        // Avoid redundant swaps
        const toMemberInFromEvent = fromEvent.people.some(member => member._id.toString() === toMemberId);
        if (toMemberInFromEvent) {
            return next(new HttpError('The member to swap with is already assigned to the fromEvent', null, 400));
        }

        const swapRequest = new SwapRequest({
            fromEvent: fromEventId,
            toEvent: toEventId,
            requester: userId,
            toMember: toMemberId
        });

        await swapRequest.save();
        res.status(201).json({ message: 'Swap request created successfully', swapRequest });
    } catch (err) {
        console.error('Error in requestEventSwap:', err);
        return next(new HttpError('Something went wrong while requesting the swap', err, 500));
    }
};

// Approves or declines a swap request
const approveSwap = async (req, res, next) => {
    try {
        const { swapRequestId, approve } = req.body;
        const userId = req.params.id; // Reviewer ID

        // Verify reviewer's permissions
        const reviewer = await Member.findById(userId);
        if (!reviewer) {
            return next(new HttpError('Reviewer not found', null, 404));
        }
        if (![Roles.TEAM_LEADER, Roles.SUPER_ADMIN].includes(reviewer.role)) {
            return next(new HttpError('Only team leaders or super admins can approve swaps', null, 403));
        }

        // Fetch and validate swap request
        const swapRequest = await SwapRequest.findById(swapRequestId)
            .populate('fromEvent')
            .populate('toEvent')
            .populate('requester')
            .populate('toMember');
        if (!swapRequest) {
            return next(new HttpError('Swap request not found', null, 404));
        }
        if (swapRequest.status !== 'pending') {
            return next(new HttpError('This swap request has already been processed', null, 400));
        }

        // Update swap request status
        swapRequest.status = approve ? 'approved' : 'declined';
        swapRequest.reviewedBy = userId;
        swapRequest.updatedAt = Date.now();

        if (approve) {
            const fromEvent = swapRequest.fromEvent;
            const toEvent = swapRequest.toEvent;

            // Swap members between events
            const requesterIndexFrom = fromEvent.people.findIndex(member => 
                member._id.toString() === swapRequest.requester._id.toString());
            const toMemberIndexTo = toEvent.people.findIndex(member => 
                member._id.toString() === swapRequest.toMember._id.toString());

            if (requesterIndexFrom === -1 || toMemberIndexTo === -1) {
                return next(new HttpError('User not found in respective event', null, 500));
            }

            fromEvent.people[requesterIndexFrom] = swapRequest.toMember._id;
            toEvent.people[toMemberIndexTo] = swapRequest.requester._id;

            await fromEvent.save();
            await toEvent.save();
        }

        await swapRequest.save();
        res.json({
            message: `Swap request ${approve ? 'approved' : 'declined'} successfully`,
            swapRequest,
            updatedFromEvent: approve ? swapRequest.fromEvent : undefined,
            updatedToEvent: approve ? swapRequest.toEvent : undefined
        });
    } catch (err) {
        console.error('Error in approveSwap:', err);
        return next(new HttpError('Something went wrong while processing the swap', err, 500));
    }
};

// Retrieves swap requests waiting for the second user (toMember) to accept/decline
const getSwapRequestsForMember = async (req, res, next) => {
    try {
        const memberId = req.params.id;
        const swapRequests = await SwapRequest.find({ toMember: memberId, status: 'pending_second_user' })
            .populate('fromEvent')
            .populate('toEvent')
            .populate('requester')
            .populate('toMember');
        res.json(swapRequests);
    } catch (err) {
        return next(new HttpError('Something went wrong while fetching swap requests', err, 500));
    }
};

// Second user accepts or declines a swap request — if accepted it moves to leader review
const respondToSwap = async (req, res, next) => {
    try {
        const { swapRequestId, accept } = req.body;
        const userId = req.params.id; // Must be the toMember

        const swapRequest = await SwapRequest.findById(swapRequestId);
        if (!swapRequest) {
            return next(new HttpError('Swap request not found', null, 404));
        }
        if (swapRequest.status !== 'pending_second_user') {
            return next(new HttpError('This swap request is not awaiting your response', null, 400));
        }
        if (swapRequest.toMember.toString() !== userId) {
            return next(new HttpError('You are not the target member for this swap request', null, 403));
        }

        if (accept) {
            // Move to leader review queue
            swapRequest.status = 'pending';
        } else {
            swapRequest.status = 'declined';
        }
        swapRequest.updatedAt = Date.now();
        await swapRequest.save();

        res.json({
            message: `Swap request ${accept ? 'accepted and sent to leader for review' : 'declined'}`,
            swapRequest,
        });
    } catch (err) {
        console.error('Error in respondToSwap:', err);
        return next(new HttpError('Something went wrong while responding to the swap', err, 500));
    }
};

// Retrieves swap requests ready for leader review (toMember already accepted)
const getPendingSwapRequests = async (req, res, next) => {
    try {
        const swapRequests = await SwapRequest.find({ status: 'pending' })
            .populate('fromEvent')
            .populate('toEvent')
            .populate('requester')
            .populate('toMember');
        res.json(swapRequests);
    } catch (err) {
        return next(new HttpError('Something went wrong while fetching swap requests', err, 500));
    }
};

export { getAllEvents, getOneEvent, getAllEventTypes, deleteEventType, updateEventType, createEvent, updateEvent, deleteEvent, getUserEvents, createEventType, requestEventSwap, approveSwap, getPendingSwapRequests, getSwapRequestsForMember, respondToSwap };