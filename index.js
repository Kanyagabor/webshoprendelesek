import express from "express";
import rendelesek from "./routes/rendelesek.js";
import vasarlok from "./routes/vasarlok.js";
import termekek from "./routes/termekek.js";
import statisztika from "./routes/statisztika.js";


const app= express();

app.use("/rendelesek", rendelesek);
app.use("/vasarlok", vasarlok);
app.use("/termekek", termekek);
app.use("/statisztika", statisztika);


app.listen(3000, ()=>{
    console.log("http://localhost:3000")
})