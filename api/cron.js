import { readFileSync, writeFileSync, mkdirSync } from "fs";
export default async function handler(req, res){
  if(req.headers["x-vercel-cron"] !== "1") return res.status(401).send("Unauthorized");
  try{
    // Fetch feeds would need network, for now return ok
    mkdirSync("output", { recursive: true });
    writeFileSync("output/run.log", new Date().toISOString());
    res.status(200).json({ok:true});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}

