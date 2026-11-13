import express from "express";
import pool from "../utils/db.js";


const router= express.Router();


router.get("/", async (req,res) =>{
    let sql=`SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz, vasarlok.nev, COUNT(tetelek.termek_id) AS tételdb, SUM(tetelek.egysegar*tetelek.db) AS összár FROM rendelesek
                INNER JOIN vasarlok ON rendelesek.vasarlo_id= vasarlok.id
                INNER JOIN tetelek ON rendelesek.id= tetelek.rendeles_id
                GROUP BY rendelesek.id
                HAVING 1`;
    if(Object.keys(req.query).length==0){
        sql+= ` ORDER BY rendelesek.datum, SUM(tetelek.db) ASC`;
        const [eredmeny]= await pool.query(sql);
        return res.json(eredmeny);
    }
    else{
        const status= req.query.statusz;
        const tol= req.query.tol;
        const ig= req.query.ig;
        let lekerdezes= []
        if(status){
            sql+=` AND rendelesek.statusz = ?`;
            lekerdezes.push(status);
        }
        if(tol){
            sql+= ` AND DATE(rendelesek.datum) >= ?`;
            lekerdezes.push(tol);
        }
        if(ig){
            sql+= ` AND DATE(rendelesek.datum) <= ?`;
            lekerdezes.push(ig);
        }
        sql+= ` ORDER BY rendelesek.datum, SUM(tetelek.db) ASC`;
        const [eredmeny]= await pool.query(sql,lekerdezes);
        return res.json(eredmeny);
    }
})


router.get("/:id", async (req,res)=>{
    const id = Number(req.params.id);
    if(Number.isInteger(id)){
        let sql1=`SELECT rendelesek.id, rendelesek.datum, rendelesek.statusz FROM rendelesek WHERE rendelesek.id=?`;
        const [rendeles]= await pool.query(sql1,id);
        if (rendeles.length==0){
            res.sendStatus(404);
        }
        else{
            let sql2= `SELECT vasarlok.id, vasarlok.nev,vasarlok.email,vasarlok.varos FROM vasarlok 
                        INNER JOIN rendelesek ON vasarlok.id= rendelesek.vasarlo_id
                        WHERE rendelesek.id= ?`;
            const [vasarlok]= await pool.query(sql2,id);
            let sql3=`SELECT termekek.nev,tetelek.db, tetelek.egysegar, tetelek.db*tetelek.egysegar AS összár FROM rendelesek
                        INNER JOIN tetelek ON rendelesek.id = tetelek.rendeles_id
                        INNER JOIN termekek ON tetelek.termek_id = termekek.id
                        WHERE rendelesek.id=?`;
            const[termekek]= await pool.query(sql3,id);
            const vegosszeg= termekek.reduce((osszeg, tetel)=>{
                return osszeg+Number(tetel.összár);
            },0)

            return res.json({
                Rendeles: rendeles,
                Vasarlok: vasarlok,
                Termekek: termekek,
                Vegosszeg: vegosszeg
            });
        }
    }
})


export default router