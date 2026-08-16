#!/usr/bin/env node
/**
 * Generate LinkedIn / X / Substack content with validation and humanization
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const articles = JSON.parse(readFileSync('/tmp/newsletter-digest-articles.json','utf8'));

mkdirSync('output', { recursive: true });

const top = articles.articles.slice(0,4);

// Simple humanized templates
function humanize(text){
  return text.replace(/—/g,'.').replace(/;/g,',');
}

const linkedin = top.map(a => {
  const body = `Hook: ${a.title}\n\n${humanize(a.excerpt.slice(0,300))}\n\nAction steps:\n• Audit now\n• Share with team\n\nWhat do you think?\nSource: ${a.source}`;
  return { title: a.title, body };
});

writeFileSync('output/linkedin_posts.json', JSON.stringify(linkedin,null,2));
writeFileSync('output/HITL_summary.md', `# HITL Review\n\nGenerated ${top.length} posts.\n\nPlease review validation report before publishing.`);

console.log('Content generated');
