import HttpError from "../models/http-error.js";
import * as dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { Member } from "../models/member.js";
import { permissions } from "../config/permissions.js";

dotenv.config();

const checkToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const { authorization } = req.headers;
        console.log(authorization);

        // || !authorization.startsWith('Bearer ') add later
        if (!authorization) {
            throw new HttpError('Invalid token format', 401);
        }

        const token = authorization.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            console.error(error);

            if (error.name === 'TokenExpiredError') {
                throw new HttpError('Token has expired', 401);
            }
            throw new HttpError('Invalid Token', 401);
        }

        const { id, role } = decoded;

        const member = await Member.findById(id);
        if (!member) {
            throw new HttpError('An Error occurred', 401);
        }

        req.varifiedMember = member;
        req.userRole = role;
        req.permissions = permissions[role] || [];

        next();

    } catch (error) {
        return next(new HttpError(error.message || 'Authentication failed', error.status || 500));
    };
};

export { checkToken };