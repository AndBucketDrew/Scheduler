import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'

import { permissions } from '../config/permissions.js';

dotenv.config();
const SALT_ROUNDS = 10;

const getToken = (user) => {
    const token = jwt.sign(
        { 
            id: user._id, 
            role: user.role,
            permissions: permissions[user.role] || [],
        },
        process.env.JWT_KEY,
        { expiresIn: '1d' }
    );

    return token;
}

const getPermissions = (role) => {
    return permissions[role] || [];
}

const getHash = (plainText) => {
    const hash = bcrypt.hashSync(plainText, SALT_ROUNDS);
    return hash;
};

const checkHash = (plainText, hashText) => {
    return bcrypt.compareSync(plainText,hashText);
};

export {getToken, getHash, checkHash, getPermissions};

