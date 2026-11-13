import express from "express";
import pool from "../utils/db.js";

const router = express.Router();


router.get("/havi",async(req,res)=>{
    let sql= `SELECT DATE_FORMAT(rendelesek.datum, '%Y-%m') AS honap, COUNT(DISTINCT rendelesek.id) AS rendelesDb, SUM(tetelek.db * tetelek.egysegar) AS bevetel
                FROM rendelesek
                INNER JOIN tetelek ON rendelesek.id = tetelek.rendeles_id
                WHERE rendelesek.statusz != 'törölve'
                GROUP BY honap
                ORDER BY honap ASC`;
    const [eredmeny]= await pool.query(sql);
    return res.json(eredmeny);
})

router.get("/top-termekek",async (req,res)=>{
    if(Object.keys(req.query).length==0){
        return res.sendStatus(400);
    }
    else{
        const n= Number(req.query.n);
        if(Number.isInteger(n))
        {
        let sql =`SELECT termekek.nev,SUM(tetelek.db) AS bevetel, SUM(tetelek.db*tetelek.egysegar) AS bevetel FROM rendelesek
                    INNER JOIN tetelek ON rendelesek.id= tetelek.rendeles_id
                    RIGHT JOIN termekek ON tetelek.termek_id = termekek.id
                    GROUP BY termekek.nev
                    ORDER BY bevetel DESC LIMIT ?`;
        const [eredmeny] = await pool.query(sql,n);
        return res.json(eredmeny);
        }
        else{
            return res.sendStatus(400);
        }
    }
})


router.get("/kategoriak",async (req,res)=>{
        let sql =`SELECT termekek.kategoria,SUM(tetelek.db) AS bevetel, SUM(tetelek.db*tetelek.egysegar) AS bevetel FROM rendelesek
                    INNER JOIN tetelek ON rendelesek.id= tetelek.rendeles_id
                    RIGHT JOIN termekek ON tetelek.termek_id = termekek.id
                    GROUP BY termekek.kategoria`;
        const [eredmeny] = await pool.query(sql);
        return res.json(eredmeny);
})

export default router