import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import mongoose from 'mongoose';
import shiftsRoutes from './routes/shifts-routes.js';
import membersRoutes from './routes/members-routes.js';

dotenv.config();

// Retrieve configuration from environment variables
const PORT = process.env.PORT;
const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PW = process.env.MONGODB_PW;

//MongoDB connection 
const CONNECTION = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PW}@wifi.sm6wh.mongodb.net/`;

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use('/axios', express.static('node_modules/axios/dist')); // Serve axios library statically

// ROUTES
app.use('/members', membersRoutes); 
app.use('/shifts', shiftsRoutes);

mongoose.connect(CONNECTION).catch((err) => {
    console.log("MongoDB connection error", err);
});

// For local dev
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT || 8000, () => console.log(`http://localhost:${PORT || 8000}`));
}

export default app;