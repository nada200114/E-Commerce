
import dotenv from "dotenv";
import path from "path";
dotenv.config({path: path.resolve("config/.env")});

import express from 'express';
import { initApp } from "./src/initApp.js";

const port=process.env.PORT||5000;


const app=express();

app.set("case sensitive",true);
initApp(app,express);

app.listen(port,(req,res,next)=>{
    console.log(`Server is running on port ${port} . `);

})
