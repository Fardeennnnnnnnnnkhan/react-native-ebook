import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error Creating book");
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
        books ,
        currentPage : page,
        totalBooks ,
        totalPages : Math.ceil(totalBooks/limit),
    });
  } catch (error) {
    console.log("error in fetching the all the books route", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//recommadation books function
router.post("/", protectRoute, async (req, res) => {
    try{
        const books = await Book.find({user : req.user._id}).sort({createdAt : -1})
        res.json(books)
    }catch(err){
        console.error("Get User books error " ,err.message)
        res.status(500).json({message : "Server Error"});
    }
})

router.post("/:id", protectRoute, async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        if(!book) return res.status(404).json({message : "Book Not Found"})

            //checking if we are the owner of the book or not
        if(book.user.toString() !== req.user._id.toString())
            return res.status(401).json({message : "Unauthorized"});

        //delete the image from cardinary as well
        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId)
                
            }catch(err){
                console.log("Error deleting image from cloudinary" , err)
                res.status(500).json({message : err.message})
            }
        }

        await book.deleteOne();
        res.json({message : "Book deleted SuccessFully"})

        
    }catch(error){
        console.log("Error deleting book" , error);
        res.status(500).json({message : "Internal server error"});
    }
})

export default router;
