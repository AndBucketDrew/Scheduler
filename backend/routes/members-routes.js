//API
import { Router } from "express";
import { body, param, header } from 'express-validator';
import { createAccount, deleteMember, getAllMembers, getOneMember, login, setPassword, updateMember } from "../controllers/members.js";

// Custom sanitizer to capitalize the first letter of a string
const capitalizeFirstLetter = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const membersRoutes = new Router();

membersRoutes.get('/', getAllMembers); // Fetch all members
membersRoutes.delete('/:id', deleteMember); // Delete a member by ID
membersRoutes.get('/:id', getOneMember); // Fetch a single member by ID

// Route to create a new member with input validation
membersRoutes.post(
    '/new-member',
    body('email').escape().isEmail().toLowerCase().normalizeEmail(), // Sanitize and validate email
    body('firstName').trim().escape().isLength({ min: 2, max: 50 }).customSanitizer(capitalizeFirstLetter), // Ensure proper name length and capitalize
    body('lastName').trim().escape().isLength({ min: 2, max: 50 }).customSanitizer(capitalizeFirstLetter),
    body('number').escape().isNumeric(),
    body('birthDay').escape().isInt({ min: 1, max: 31 }),
    body('birthMonth').escape().isInt({ min: 1, max: 12 }), 
    body('birthYear').escape().isInt({ min: 1900, max: new Date().getFullYear() }),
    body('role').isIn(['super-admin', 'office-leader', 'team-leader', 'worker']).withMessage('Invalid role'), // Restrict role to predefined values
    createAccount
);

// Route to update a member with optional fields and validation
membersRoutes.patch(
    '/:id',
    body('email').optional().escape().isEmail().toLowerCase().normalizeEmail(),
    body('firstName').optional().trim().escape().isLength({ min: 2, max: 50 }).customSanitizer(capitalizeFirstLetter),
    body('lastName').optional().trim().escape().isLength({ min: 2, max: 50 }).customSanitizer(capitalizeFirstLetter),
    body('number').optional().escape().isNumeric(),
    body('birthDay').optional().escape().isInt({ min: 1, max: 31 }),
    body('birthMonth').optional().escape().isInt({ min: 1, max: 12 }),
    body('birthYear').optional().escape().isInt({ min: 1900, max: new Date().getFullYear() }),
    body('role').optional().isIn(['super-admin', 'office-leader', 'team-leader', 'worker']).withMessage('Invalid role'),
    body('mustSetPassword').optional().isBoolean().withMessage('mustSetPassword must be a boolean'), 
    updateMember
);


membersRoutes.post(
    '/login',
    body('password').escape().optional(), // Password optional for initial setup cases (NewMembers)
    body('email').escape().normalizeEmail(),
    login
);

// Route to set a new password for a member
membersRoutes.post(
    '/new-password',
    body('id').escape().isMongoId().withMessage('Invalid member ID'), 
    body('password').escape().isLength({ min: 6, max: 50 }).withMessage('Password must be between 6 and 50 characters'),
    setPassword
);

export default membersRoutes;