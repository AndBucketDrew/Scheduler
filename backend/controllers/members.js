import nodemailer from 'nodemailer';
import HttpError from "../models/http-error.js";
import { validationResult, matchedData } from 'express-validator';
import { Member, Password } from '../models/member.js';
import mongoose from 'mongoose';
import { checkHash, getHash, getToken } from '../common/index.js';
import { permissions } from '../config/permissions.js';
import { Roles } from '../config/roles.js';

// Configure Nodemailer transporter for sending emails if needed
// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.USER,
//         pass: process.env.PASS,
//     }
// });

// Creates a new member account with transaction support
const createAccount = async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        throw new HttpError(JSON.stringify(result.errors), 422);
    }

    const data = matchedData(req);
    console.log(data);

    const { role } = data;
    const userPermissions = permissions[role] || [];

    let newMember;

    try {
        const createdMember = new Member({
            ...data,
            role,
            permissions: userPermissions,
            mustSetPassword: true, // New accounts require password setup !
        });

        const session = await mongoose.startSession();
        session.startTransaction();

        newMember = await createdMember.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.json(newMember);

    } catch (error) {
        console.error("Error creating account:", error);
        return next(new HttpError("Something went wrong, please try again.", 500));
    }
};

// Handles user login and token generation
const login = async (req, res, next) => {
    try {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            throw new HttpError(JSON.stringify(result.errors), 422);
        }

        const data = matchedData(req);

        const targetMember = await Member.findOne({ email: data.email });

        if (!targetMember) {
            throw new HttpError('Error finding Member', 404);
        }

        // Check if user needs to set a password
        if (targetMember.mustSetPassword) {
            return res.status(200).json({
                message: "Password setup required. Please provide a new password.",
                memberId: targetMember._id,
                requiresPasswordSetup: true,
            });
        }

        const memberPassword = await Password.findOne({ member: targetMember._id });

        if (!checkHash(data.password, memberPassword.password)) {
            throw new HttpError('Email or Password is incorrect', 401);
        }

        const token = getToken(targetMember);
        res.json(token);
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

// Updates an existing member's details
const updateMember = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log('Validation errors:', result.array());
            throw new HttpError(JSON.stringify(result.array()), 422);
        }

        const data = matchedData(req);
        console.log('Received data:', data);

        const foundMember = await Member.findById(id);
        if (!foundMember) {
            throw new HttpError('Member cannot be found', 404);
        }

        // Update role and permissions if role is provided
        if (data.role) {
            const validRoles = Object.values(Roles);
            if (!validRoles.includes(data.role)) {
                throw new HttpError(`Invalid role provided. Must be one of: ${validRoles.join(', ')}`, 400);
            }
            foundMember.role = data.role;
            foundMember.permissions = permissions[data.role] || [];
        }

        // Explicitly handle mustSetPassword flag
        if (data.mustSetPassword !== undefined) {
            foundMember.mustSetPassword = data.mustSetPassword;
        }

        Object.assign(foundMember, data);

        const updatedMember = await foundMember.save();
        res.json(updatedMember);
    } catch (error) {
        console.error('Update member error:', error);
        return next(new HttpError(error.message || 'Internal server error', error.errorCode || 500));
    }
};

// Sets a new password for a member with mustSetPassword 
const setPassword = async (req, res, next) => {
    const { id, password } = req.body;

    try {
        const member = await Member.findById(id);
        const hashedPassword = getHash(password);

        const session = await mongoose.startSession();
        session.startTransaction();

        // Create and save new password entry
        const createdPassword = new Password({
            password: hashedPassword,
            member: member._id,
        });
        await createdPassword.save({ session });

        // Update member to reflect password being set
        member.mustSetPassword = false;
        await member.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: 'Password was set successfully' });
    } catch (err) {
        console.error('Error in setPassword()', err);
    }
};

// Retrieves all members from the database
const getAllMembers = async (req, res, next) => {
    try {
        const memberList = await Member.find({}).populate('users');
        res.json(memberList);
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

// Fetches a single member by ID
const getOneMember = async (req, res, next) => {
    try {
        const member = await Member.findById(req.params.id).populate('users');
        if (!member) {
            throw new HttpError('Error user not Found!', 404);
        }
        res.json(member);
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

// Deletes a member by ID
//TODO in future: Update delete handling so that the user asssociated with event/shifts gets removed from said event/shifts
const deleteMember = async (req, res, next) => {
    try {
        const targetMember = await Member.findByIdAndDelete({ _id: req.params.id });

        if (!targetMember) {
            throw new HttpError('User not Found', 404);
        }

        res.send('User deleted successfully');
    } catch (error) {
        return next(new HttpError(error, error.errorCode || 500));
    }
};

export { createAccount, login, setPassword, getAllMembers, getOneMember, deleteMember, updateMember };