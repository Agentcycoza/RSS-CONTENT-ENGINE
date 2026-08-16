import { readFileSync, writeFileSync, mkdirSync } from "fs";
import Parser from "rss-parser";

const parser = new Parser();

async function fetchFeeds(){
  const feeds = JSON.parse(readFileSync("feeds.json","utf8"));
  const articles = [];
  for(const f of feeds){
    try{
      const feed = await parser.parseURL(f.url);
      for(const item of feed.items.slice(0,10)){
        articles.push({ title: item.title, url: item.link, source: f.name, excerpt: item.contentSnippet || "" });
      }
    }catch(e){ console.warn("Feed error", f.name, e.message); }
  }
  return articles;
}

function humanize(text){
  let t = text.replace(/[—–]/g,". ").replace(/;/g,",").replace(/\s+/g," ").trim();
  t = t.split(".").map(s=>s.trim()).filter(Boolean).slice(0,6).join(". ") + ".";
  return t;
}

async function synthesize(article){
  const key = process.env.GROQ_API_KEY;
  if(!key) return humanize(article.excerpt);
  const prompt = `Summarize this article in 3 short active sentences, preserve facts: ${article.title} ${article.excerpt.slice(0,400)}`;
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json"},
    body: JSON.stringify({ model:"llama-3.1-70b-versatile", messages:[{role:"system",content:"Write in active voice, short sentences, no em dashes, no semicolons."},{role:"user",content:prompt}], temperature:0.3 })
  });
  const data = await resp.json();
  return humanize(data.choices?.[0]?.message?.content || article.excerpt);
}

async function createGitHubIssue(repoOwner, repoName, token, title, body){
  const resp = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
    method:"POST",
    headers:{ Authorization:`token ${token}`, "Content-Type":"application/json", "User-Agent":"RSS-Content-Engine" },
    body: JSON.stringify({ title, body })
  });
  return resp.json();
}

export default async function handler(req, res){
  if(req.headers["x-vercel-cron"] !== "1") return res.status(401).send("Unauthorized");
  try{
    mkdirSync("output", { recursive:true });
    const articles = await fetchFeeds();
    const results = [];
    for(const a of articles.slice(0,4)){
      const body = await synthesize(a);
      results.push({ title:a.title, url:a.url, source:a.source, body });
    }
    writeFileSync("output/results.json", JSON.stringify(results,null,2));
    
    const issueBody = `# HITL Review ${new Date().toISOString().slice(0,10)}\n\nGenerated ${results.length} posts.\n\nReview output before publishing.`;
    const githubToken = process.env.GITHUB_TOKEN;
    if(githubToken){
      await createGitHubIssue("mikewithoutthemechanics","RSS-CONTENT-ENGINE", githubToken, `HITL Review ${new Date().toISOString().slice(0,10)}`, issueBody);
    }
    res.status(200).json({ ok:true, count: results.length });
  }catch(e){
    console.error(e);
    res.status(500).json({ error:e.message });
  }
}

