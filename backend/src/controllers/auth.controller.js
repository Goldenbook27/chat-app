import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from 'bcryptjs'
export const signup = async(req,res)=>{
    const {fullName, email, password, userName,profilePic} = req.body;
    try {
        if(!fullName || !email || !password || !userName){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email})
        if(user) return res.status(400).json({message: "Email already exists"})
        
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password,salt)

            const newUser = new User({
                fullName,
                email,
                password:hashedPassword,
                userName
            })

            if(newUser){
                generateToken(newUser._id,res)
                await newUser.save()
                res.status(201).json({
                    _id:newUser._id,
                    fullName: newUser.fullName,
                    email:newUser.email,
                    profilePic: newUser.profilePic,
                    userName: userName
                })
            }else{
                res.status(400).json({message:"Invalid user data"})
            }
    } catch (error) {
        console.log("Error in signing up",error.message)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const login = async(req,res)=>{
    const {email,password} = req.body

    try {

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        } 
        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
        generateToken(user._id,res)
        return res.status(200).json({
            _id: user._id,
            userName : user.userName,
            fullName : user.fullName,
            email: user.email,
            profilePic :user.profilePic
        })

    } catch (error) {
        console.log("Error in log in controller",error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
    
}

export const logout = (req,res)=>{
    try {
        res.cookie("BEARER","",{maxAge:0})
        return res.status(200).json({
            message:"Logged out successfully"
        })
    } catch (error) {
        console.log("Error in Log out controller",error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const updateProfile = async(req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"})

        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic: uploadResponse.secure_url},{new:true})

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error in Update Profile controller",error.message)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}