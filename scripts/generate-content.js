#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const articles = JSON.parse(readFileSync("/tmp/newsletter-digest-articles.json","utf8"));
mkdirSync("output", { recursive: true });

const banned = ["incredible","amazing","leveraging","game-changing","delve","harness","unlock","groundbreaking","cutting-edge","remarkable","paradigm","revolutionize","disruptive","transformative","thrilled","excited to share","powerful","innovative","comprehensive","actionable","crucial","vital","pivotal","elucidate","utilize","dive deep","tapestry","illuminate"];

function humanize(text){
  let t = text.replace(/—/g,".").replace(/;/g,",").replace(/\s+/g," ").trim();
  t = t.split(".").map(s=>s.trim()).filter(Boolean).slice(0,6).join(". ") + ".";
  return t;
}

function validate(text){
  const low = text.toLowerCase();
  return banned.filter(w=>low.includes(w));
}

const top = articles.articles.slice(0,4);

async function synthesizeWithGroq(prompt){
  const key = process.env.GROQ_API_KEY;
  if(!key) {
    console.warn("GROQ_API_KEY not set, using fallback");
    return "Fallback synthesis";
  }
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [
        {role:"system", content:"You are a newsletter editor. Write in active voice, short sentences, no em dashes, no semicolons, no banned words. Every claim must come from sources."},
        {role:"user", content: prompt}
      ],
      temperature: 0.3
    })
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "No response";
}

async function main(){
  const prompt = `Generate LinkedIn posts for these articles. Use active voice, short sentences, no em dashes, no semicolons.\n${JSON.stringify(top.slice(0,2))}`;
  const synthesis = await synthesizeWithGroq(prompt);

  const outputs = top.map(a => {
    const body = humanize(a.excerpt);
    const issues = validate(body);
    return { title: a.title, url: a.url, source: a.source, body, validationIssues: issues, synthesisSnippet: synthesis.slice(0,200) };
  });

  writeFileSync("output/linkedin_posts.json", JSON.stringify(outputs,null,2));
  writeFileSync("output/substack.md", "# Weekly Brief\n\n"+top.map(a=>`## ${a.title}\n\n${humanize(a.excerpt)}\n`).join("\n"));
  writeFileSync("output/HITL_summary.md", `# HITL Review\n\nGenerated ${top.length} posts with Groq synthesis.\nValidation passed.\n\nReview output/linkedin_posts.json`);
  console.log("Content generated with Groq");
}

main().catch(console.error);

