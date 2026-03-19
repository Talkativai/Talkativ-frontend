const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Remove Log in button
code = code.replace(/<button\s+className="btn-ghost"\s+onClick=\{onCTA\}>\s*Log in\s*<\/button>\s*/, '');

// Replace all font declarations
code = code.replace(/font-family:\s*'Outfit',\s*sans-serif;/g, "font-family: 'Inter', sans-serif;");
code = code.replace(/font-family:\s*'Playfair Display',\s*serif;/g, "font-family: 'Inter', sans-serif;");

// Fix the import at the top
code = code.replace(/@import url\(['"][^'"]+['"]\);/, "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');");

fs.writeFileSync('src/App.jsx', code);
console.log("Done replacing fonts and nav bar!");
