#!/usr/bin/env node
import { readFileSync } from 'fs';

const banned = ['incredible','amazing','leveraging','game-changing','delve','harness','unlock','groundbreaking','cutting-edge','remarkable','paradigm','revolutionize','disruptive','transformative'];
const content = readFileSync('output/linkedin_posts.json','utf8');
const hits = banned.filter(w => content.toLowerCase().includes(w));
if (hits.length) {
  console.error('Banned words found:', hits);
  process.exit(1);
}
console.log('Validation passed');
