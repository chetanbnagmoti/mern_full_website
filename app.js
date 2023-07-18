//Services:-
require("dotenv").config();
require("./db/connection");
const express=require('express');
const router=require("./Routes/router")
const cors=require("cors");
const PORT=6010;

const app=express();

//MiddleWare:-
app.use(cors());
app.use(express.json());
app.use(router);
app.use("/uploads",express.static("./uploads"));
app.use("/files",express.static("./public/files"));


//Routes:-
app.get("/",(req,res)=>{
    res.status(201).json("Server Start");
})

app.listen(PORT,()=>{
    console.log("Server Run At "+PORT);
})