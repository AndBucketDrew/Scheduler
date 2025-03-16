import { Router } from "express";
import mongoose from "mongoose";
import { body, param, header } from 'express-validator';
import { createEvent, createEventType, deleteEvent, getAllEvents, getAllEventTypes, getUserEvents, updateEvent, getOneEvent, requestEventSwap, approveSwap, getPendingSwapRequests, deleteEventType, updateEventType } from "../controllers/shifts.js";


const shiftsRoutes = new Router();


shiftsRoutes.get('/all-shifts', getAllEvents);
shiftsRoutes.get('/single-shift/:id', getOneEvent);

shiftsRoutes.post(
    '/new-shift', 
    body('type').notEmpty().withMessage('Event type is required'),
    body('people')
        .custom((value) => {
            // Validate that people is either a single valid ObjectId or an array of valid ObjectIds (when more people are assigned)
            if (Array.isArray(value)) {
                return value.every((id) => mongoose.Types.ObjectId.isValid(id));
            }
            return mongoose.Types.ObjectId.isValid(value);
        }).withMessage('People must be valid ObjectId(s)'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'), 
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('location').trim().escape().isString(), 
    createEvent
);

// Route to update an existing shift with optional fields
shiftsRoutes.put(
    '/:id',
    body('type').optional().notEmpty(),
    body('people')
        .optional()
        .custom((value) => {
            let ids = value;
            // Handle string input (CSV) by splitting into array
            if (typeof value === 'string') {
                ids = value.split(',').map(id => id.trim());
            }
            if (Array.isArray(ids)) {
                return ids.every(id => mongoose.Types.ObjectId.isValid(id));
            }
            return mongoose.Types.ObjectId.isValid(value);
        }).withMessage('People must be valid ObjectId(s)'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('location').optional().trim().isString(),
    updateEvent
);

shiftsRoutes.delete('/:id', deleteEvent); 

shiftsRoutes.get('/my-shifts/:id', getUserEvents); 

shiftsRoutes.post('/event-type',
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('icon').optional().isString(),
    body('color').isString().notEmpty().withMessage('Color is required'),
    createEventType
);

shiftsRoutes.get('/event-type', getAllEventTypes); 
shiftsRoutes.delete('/event-type/:id', deleteEventType);

// Route to update an event type with optional fields
shiftsRoutes.put(
    '/event-type/:id',
    [
        body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string'),
        body('icon').optional().isString(),
        body('color').optional().isString().notEmpty().withMessage('Color must be a non-empty string')
    ],
    updateEventType
);

shiftsRoutes.get('/pending', getPendingSwapRequests); 


shiftsRoutes.post(
    '/swap-shift/:id',
    param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid requester ID'),
    body('fromEventId').notEmpty().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid From Event ID is required'),
    body('toEventId').notEmpty().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid To Event ID is required'),
    body('toMemberId').notEmpty().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid toMember ID is required'),
    requestEventSwap
);

// Route to approve or decline a shift swap
shiftsRoutes.post(
    '/swap-shift/review/:id',
    param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid reviewer ID'),
    body('swapRequestId').notEmpty().custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Valid swapRequest ID is required'),
    body('approve').isBoolean().withMessage('Approve must be a boolean (true/false)'),
    approveSwap
);

export default shiftsRoutes;
