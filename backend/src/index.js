import express from 'express'
import authRoutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'
import messageRoutes from "./routes/message.routes.js"
const app = express()
dotenv.config()

const PORT = process.env.PORT                                                              

app.use(express.json())
app.use(cookieParser())
app.use('/v1/api/auth',authRoutes)
app.use('/v1/api/message',messageRoutes)

app.get('/',(req,res)=>{
    res.send('Hello')
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})