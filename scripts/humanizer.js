#!/usr/bin/env node
export function humanize(text){
  if(!text) return text;
  let t = text
    .replace(/[—–]/g,". ")
    .replace(/;/g,",")
    .replace(/\s+/g," ")
    .trim();
  // Remove AI vocabulary and promotional words
  const aiWords = ["actually","additionally","align with","crucial","delve","emphasizing","enduring","enhance","fostering","garner","highlight","interplay","intricate","key","landscape","pivotal","showcase","tapestry","testament","underscore","valuable","vibrant","boasts","vibrant","profound","showcasing","exemplifies","commitment to","breathtaking","must-visit","stunning"];
  aiWords.forEach(w=>{ const re = new RegExp(`\\b${w}\\b`,`gi`); t = t.replace(re,""); });
  // Split long sentences
  t = t.split(".").map(s=>s.trim()).filter(Boolean).slice(0,8).join(". ") + ".";
  // Remove em dashes leftovers and clean
  t = t.replace(/\s+/g," ");
  return t;
}

