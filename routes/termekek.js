import express from "express";
import pool from "../utils/db.js";

const router= express.Router();


router.get("/sosem-rendelt",async (req,res)=>{
    let sql = `SELECT termekek.id, termekek.nev, termekek.kategoria, termekek.ar
                FROM termekek
                LEFT JOIN tetelek ON termekek.id = tetelek.termek_id
                WHERE tetelek.id IS NULL`;
    const [eredmeny]= await pool.query(sql);
    return res.json(eredmeny);
})

export default router