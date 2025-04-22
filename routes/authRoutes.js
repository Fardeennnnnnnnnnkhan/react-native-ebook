import express from 'express'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken =(userId) =>{
   return  jwt.sign({userId} ,process.env.JWT_SECRET, {expiresIn : "15d"})
}

router.post("/register" , async (req , res) =>{
    try {
        const {username,email,password } = req.body;
    
        // Check for missing fields
        if (!username || !email || !password) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }
    
        // Hash the password    
        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`
        // Save the new user
        const user = new User({
          username,
          email,
          password,
          profileImage,
        });
    
        await user.save();
    
        // Create a JWT token
        const token =  generateToken(user._id)
    
        res.status(201).json({
          message: "User registered successfully",
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage : user.profileImage,
          }
        });
    
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
})



router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the password matches
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = generateToken(user._id);

        // Respond with success and the token
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router