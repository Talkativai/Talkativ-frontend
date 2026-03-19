const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update App router
code = code.replace(
  /const go = s => \{ setScreen\(s\); window\.scrollTo\(0, 0\); \};/,
  "const go = s => { document.body.classList.remove('mob-nav-open'); setScreen(s); window.scrollTo(0, 0); };"
);

const routerPattern = /if \(screen === "landing"\)(?:.|\n)*?if \(screen === "settings"\)[^\n]+;/;
const routerMatch = code.match(routerPattern);
if (routerMatch) {
  const renderScreenFunc = `  const renderScreen = () => {\n    ${routerMatch[0].replace(/\n/g, '\n    ')}\n  };\n\n  return (\n    <>\n      <div className="dash-overlay" onClick={() => document.body.classList.remove('mob-nav-open')} />\n      {renderScreen()}\n    </>\n  );`;
  if (!code.includes('className="dash-overlay"')) {
    code = code.replace(routerPattern, renderScreenFunc);
  }
}

// 2. Inject Hamburger button safely
let lines = code.split('\n');
let modifiedCount = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="dash-topbar"')) {
    // Topbar found, look for inner <div> in the next 1-2 lines
    if (lines[i+1].includes('<div>') && !lines[i+1].includes('gap:')) {
      lines[i+1] = lines[i+1].replace('<div>', 
        '<div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>\n            <button className="resp-show-mobile" onClick={() => document.body.classList.add(\'mob-nav-open\')} style={{ background: "transparent", border: "none", fontSize: 26, cursor: "pointer", padding: 0, color: T.ink, marginTop: -2 }}>☰</button>\n            <div>'
      );
      
      // Close the inner div we just opened
      for(let j = i + 2; j < lines.length; j++) {
        if (lines[j].includes('<div className="dash-topbar-right"')) {
          lines.splice(j, 0, '            </div>');
          modifiedCount++;
          i = j + 1; // Skip ahead
          break;
        }
        if (lines[j].includes('{/* CONTENT */}')) {
          // Go up 2 lines (before the </div>\n        </div>\n structure)
          lines.splice(j - 2, 0, '            </div>');
          modifiedCount++;
          i = j + 1; // Skip ahead
          break;
        }
      }
    }
  }
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('Update complete, modified topbars: ' + modifiedCount);
