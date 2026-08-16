export default async function handler(req, res){
  const allowed = req.headers["x-vercel-cron"] === "1" || req.query.test === "1";
  if(!allowed) return res.status(401).send("Unauthorized");
  res.status(200).json({ ok:true, message:"Manual test passed" });
}
