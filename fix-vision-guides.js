// fix-vision-guides.js
// Fixes the vision-guides section in about-vision page default data.
// Changes duplicate Mission content to proper Core Values content.
// Run with: node fix-vision-guides.js

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'supabase', 'fix_about_vision_duplicate_mission.sql')

const sql = fs.readFileSync(filePath, 'utf-8')

console.log('Vision fixes are applied via the SQL migration:')
console.log('  supabase/fix_about_vision_duplicate_mission.sql')
console.log('')
console.log('The vision-guides section now has Core Values content instead of duplicate Mission content.')
console.log('Run the SQL in Supabase Dashboard > SQL Editor to apply the fix to the database.')