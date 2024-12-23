import jwt from "jsonwebtoken"
import User from "../models/user.models.js"

export const protectRoute = async(req,res,next)=>{
    try {
        const token = req.cookies.BEARER
        if(!token){
            return res.status(400).json({message:"Unauthorized - No Token Provided"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(400).json({message:"Unauthorized - Invalid Token"})
        }
        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        req.user = user

        next()
    } catch (error) {
        console.log("Error in protect route middleware",error.message)
        return res.status(500).json({message: "Internal Server Error"})
    }
}