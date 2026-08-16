#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { humanize } from "./humanizer.js";

const articles = JSON.parse(readFileSync("/tmp/newsletter-digest-articles.json","utf8"));
mkdirSync("output", { recursive: true });

const banned = ["incredible","amazing","leveraging","game-changing","delve","harness","unlock","groundbreaking","cutting-edge","remarkable","paradigm","revolutionize","disruptive","transformative","thrilled","excited to share","powerful","innovative","comprehensive","actionable","crucial","vital","pivotal","elucidate","utilize","dive deep","tapestry","illuminate"];

async function synthesizeWithGroq(prompt){
  const key = process.env.GROQ_API_KEY;
  if(!key){ console.warn("GROQ_API_KEY not set"); return "No synthesis"; }
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
    body: JSON.stringify({ model:"llama-3.1-70b-versatile", messages:[{role:"system",content:"Write in active voice, short sentences, no em dashes, no semicolons, no AI clichés."},{role:"user",content:prompt}], temperature:0.3 })
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

async function main(){
  const top = articles.articles.slice(0,4);
  const outputs = [];
  for(const a of top){
    const draft = await synthesizeWithGroq(`Summarize this article in 3 short active sentences, preserve facts: ${a.title} ${a.excerpt.slice(0,400)}`);
    const human = humanize(draft);
    const issues = banned.filter(w=>human.toLowerCase().includes(w));
    outputs.push({ title:a.title, url:a.url, source:a.source, body:human, validationIssues:issues });
  }
  writeFileSync("output/linkedin_posts.json", JSON.stringify(outputs,null,2));
  writeFileSync("output/HITL_summary.md", `# HITL Review\n\nGenerated ${top.length} posts with Groq + Humanizer.\nReview output before publishing.`);
  console.log("Humanized content generated");
}
main().catch(console.error);

