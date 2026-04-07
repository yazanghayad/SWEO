import fs from 'fs';
import { execSync } from 'child_process';

// 1. Fix BAILOUT_TO_CLIENT_SIDE_RENDERING
const bailoutFiles = execSync(
  "grep -rl 'BAILOUT_TO_CLIENT_SIDE_RENDERING' 'src/app/(landing)/' --include='*.tsx'",
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

let bailoutFixed = 0;
for (const file of bailoutFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content.length;
  content = content.replace(/BAILOUT_TO_CLIENT_SIDE_RENDERING/g, '');
  if (content.length !== before) {
    fs.writeFileSync(file, content);
    bailoutFixed++;
  }
}
console.log(`BAILOUT: Fixed ${bailoutFixed} files`);

// 2. Fix playsinline="" → playsInline
let playsinlineFiles = [];
try {
  playsinlineFiles = execSync(
    "grep -rl 'playsinline=' 'src/app/(landing)/' --include='*.tsx'",
    { encoding: 'utf8' }
  ).trim().split('\n').filter(Boolean);
} catch(e) { /* no matches */ }

let playsinlineFixed = 0;
for (const file of playsinlineFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content;
  content = content.replace(/playsinline=""/g, 'playsInline');
  content = content.replace(/playsinline="true"/g, 'playsInline');
  content = content.replace(/playsinline={true}/g, 'playsInline');
  if (content !== before) {
    fs.writeFileSync(file, content);
    playsinlineFixed++;
  }
}
console.log(`playsinline: Fixed ${playsinlineFixed} files`);

// 3. Fix disablepictureinpicture="" → disablePictureInPicture
let dpipFiles = [];
try {
  dpipFiles = execSync(
    "grep -rl 'disablepictureinpicture=' 'src/app/(landing)/' --include='*.tsx'",
    { encoding: 'utf8' }
  ).trim().split('\n').filter(Boolean);
} catch(e) { /* no matches */ }

let dpipFixed = 0;
for (const file of dpipFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content;
  content = content.replace(/disablepictureinpicture=""/g, 'disablePictureInPicture');
  content = content.replace(/disablepictureinpicture="true"/g, 'disablePictureInPicture');
  if (content !== before) {
    fs.writeFileSync(file, content);
    dpipFixed++;
  }
}
console.log(`disablepictureinpicture: Fixed ${dpipFixed} files`);

// 4. Fix patterncontentunits → patternContentUnits
let pcuFiles = [];
try {
  pcuFiles = execSync(
    "grep -rl 'patterncontentunits=' 'src/app/(landing)/' --include='*.tsx'",
    { encoding: 'utf8' }
  ).trim().split('\n').filter(Boolean);
} catch(e) { /* no matches */ }

let pcuFixed = 0;
for (const file of pcuFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const before = content;
  content = content.replace(/patterncontentunits=/g, 'patternContentUnits=');
  if (content !== before) {
    fs.writeFileSync(file, content);
    pcuFixed++;
  }
}
console.log(`patterncontentunits: Fixed ${pcuFixed} files`);

console.log('\nDone! Total changes:');
console.log(`  BAILOUT: ${bailoutFixed}`);
console.log(`  playsinline: ${playsinlineFixed}`);
console.log(`  disablepictureinpicture: ${dpipFixed}`);
console.log(`  patterncontentunits: ${pcuFixed}`);
