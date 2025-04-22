import express from 'express'
import cors from "cors"
import "dotenv/config"
import authRoutes from '../routes/authRoutes.js'
import booksRoutes from '../routes/booksRoutes.js'
import { connectDB } from '../lib/db.js'
import job from '../lib/cron.js'
const app = express()
const PORT  = process.env.PORT || 3000

job.start();

// ✅ Middleware to parse JSON

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth" , authRoutes)
app.use("/api/books" , booksRoutes)

app.listen(PORT , () =>{
    console.log(`Server is running at http://localhost:${PORT}/`);
    connectDB()
})