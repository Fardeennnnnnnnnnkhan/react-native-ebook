import bcrypt from "bcryptjs";
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
    },
     email : {
        type : String,
        required : true,
        unique : true,
     },
     password : {
        type : String,
        required : true,
        minLength : 6,
     },
     profileImage : {
        type : String,
        default : "",
     }

}  , {timestamps : true})


//hashing the password before saving it to the database
userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next();

    const salt  = await  bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//comparing passwords

userSchema.methods.comparePassword = async function (userPassword) {
    return bcrypt.compare(userPassword,this.password);
}


const User = mongoose.model("User", userSchema)

export default User;