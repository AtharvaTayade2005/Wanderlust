const express=require("express");
const router=express.Router();

app.get("/:id",(req,res)=>{
    res.send("GET for post id")
})
app.post("/",(req,res)=>{
    res.send("POST for users");
})
app.delete("/:id",(req,res)=>{
    res.send("DELETE for post id");
})
app.get("/",(req,res)=>{
    res.send("GET for posts");
});