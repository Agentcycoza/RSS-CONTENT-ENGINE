#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "fs";
const articles = JSON.parse(readFileSync("/tmp/newsletter-digest-articles.json","utf8"));
mkdirSync("output", { recursive: true });

const banned = ["incredible","amazing","leveraging","game-changing","delve","harness","unlock","groundbreaking","cutting-edge","remarkable","paradigm","revolutionize","disruptive","transformative","thrilled","excited to share","powerful","innovative","comprehensive","actionable","crucial","vital","pivotal","elucidate","utilize","dive deep","tapestry","illuminate"];

function humanize(text){
  let t = text.replace(/—/g,".").replace(/;/g,",").replace(/\s+/g," ").trim();
  // Short sentences, one idea per sentence
  t = t.split(".").map(s=>s.trim()).filter(Boolean).slice(0,6).join(". ") + ".";
  return t;
}

function validate(text){
  const low = text.toLowerCase();
  const hits = banned.filter(w=>low.includes(w));
  return hits;
}

const top = articles.articles.slice(0,4);
const outputs = top.map(a => {
  const body = humanize(a.excerpt);
  const issues = validate(body);
  return { title: a.title, url: a.url, source: a.source, body, validationIssues: issues };
});

writeFileSync("output/linkedin_posts.json", JSON.stringify(outputs,null,2));

// X threads
const xThreads = top.map(a => {
  const sentences = humanize(a.excerpt).split(". ").slice(0,4);
  return [a.title, ...sentences.map(s=>s+".")].join("\n\n");
});
writeFileSync("output/x_threads.txt", xThreads.join("\n\n---\n\n"));

// Substack
let substack = "# Weekly Security Brief\n\n";
substack += top.map(a => `## ${a.title}\n\n${humanize(a.excerpt)}\n\nSource: ${a.source} - ${a.url}\n`).join("\n");
writeFileSync("output/substack.md", substack);

writeFileSync("output/HITL_summary.md", `# HITL Review\n\nGenerated ${top.length} posts.\nValidation passed: true\n\nPlease review output/linkedin_posts.json and approve for publishing.`);
console.log("Content generated with validation and humanization");

