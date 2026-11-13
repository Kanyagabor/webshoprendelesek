import express from "express";
import pool from "../utils/db.js";


const router = express.Router();


router.get("/", async (req,res)=>{
    let sql= `SELECT vasarlok.id, vasarlok.nev,vasarlok.email,vasarlok.varos, COUNT(DISTINCT rendelesek.id)összrendelés_db, SUM(tetelek.db*tetelek.egysegar) AS összérték FROM vasarlok
                LEFT JOIN rendelesek ON vasarlok.id= rendelesek.vasarlo_id
                LEFT JOIN tetelek ON rendelesek.id = tetelek.rendeles_id
                GROUP BY vasarlok.id
                ORDER BY összérték DESC`;
    const[eredmeny]= await pool.query(sql);
    return res.json(eredmeny);
})



router.get("/:id/rendelesek",async (req,res)=>{
    const id= Number(req.params.id);
    if(Number.isInteger(id)){
        let sql=`SELECT vasarlok.id, vasarlok.nev,vasarlok.email,vasarlok.varos, COUNT(DISTINCT rendelesek.id)összrendelés_db, SUM(tetelek.db*tetelek.egysegar) AS összérték FROM vasarlok
                    LEFT JOIN rendelesek ON vasarlok.id= rendelesek.vasarlo_id
                    LEFT JOIN tetelek ON rendelesek.id = tetelek.rendeles_id
                    GROUP BY vasarlok.id
                    HAVING vasarlok.id =?
                    ORDER BY összérték DESC`;

        const [eredmeny]= await pool.query(sql,id);

        if(eredmeny.length==0){
            return res.sendStatus(404);
        }
        else{
            const db= eredmeny.reduce((osszeg,tetel)=>{
                return osszeg+ Number(tetel.összrendelés_db);
            },0)
            if (db==0){
                return res.json([]);
            }
            else{
                return res.json(eredmeny);
            }
        }
    }
    else{
        return res.sendStatus(400);
    }
})


export default router


