const express=require("express");
const router=express.Router();
router.get("/users/:id",(req,res)=>{
    res.send("GET for user id");
});
router.get("/users",(req,res)=>{
    res.send("GET for users");
});

router.post("/users",(req,res)=>{
    res.send("POST for users");
})
router.delete("/users/:id",(req,res)=>{
    res.send("DELETE for user id");
});

module.exports=router;