import mongoose from 'mongoose'

export  const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DataBase")
    }catch{
        console.log("Error connecting to database" , error);
        process.exit(1);

    }
}

