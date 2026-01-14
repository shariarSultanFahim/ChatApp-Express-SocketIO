router.get("/",(_req,res)=>{
    res.status(200).json({ success: true, message: "This is chat route" });
})