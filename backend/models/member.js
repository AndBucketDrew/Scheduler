import mongoose from "mongoose";
import { Roles } from "../config/roles.js";


const Schema = mongoose.Schema
const membersSchema = new Schema(
  {
    email: { type: String, require: true, unique: true },
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    number: { type: String, require: true },
    birthDay: { type: Number, require: true },
    birthMonth: { type: Number, require: true },
    birthYear: { type: Number, require: true },
    age: Number,
    users: { type: mongoose.Types.ObjectId, ref: 'Member'},
    role: { type: String, enum: Object.values(Roles), default: Roles.WORKER },
    mustSetPassword: { type: Boolean, default: false }
  },
);

const passwordSchema = new mongoose.Schema({
    password: { type: String, required: true },
    member: { type: mongoose.Types.ObjectId, required: true, ref: 'Member' }
});


export const Member = mongoose.model('Member', membersSchema);
export const Password = mongoose.model('Password', passwordSchema);
