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
const CONNECTION = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PW}@cluster0.6ufcv.mongodb.net/`;

const app = express();

app.use(cors());

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use('/axios', express.static('node_modules/axios/dist')); // Serve axios library statically

// ROUTES
app.use('/members', membersRoutes); 
app.use('/shifts', shiftsRoutes);

// Connect to MongoDB and start the server
mongoose.connect(CONNECTION).then(() => {
    app.listen(PORT, () => {
        console.log(`http://localhost:8080`);
    });
}).catch((err) => {
    console.log("Error on startup", err);
});