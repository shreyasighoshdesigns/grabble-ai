const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            callback(dirPath);
        }
    });
}

walkDir(srcDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace typical primary CTAs
    // bg-zinc-900 text-white hover:bg-zinc-800
    content = content.replace(/bg-zinc-900 text-white/g, 'bg-[#a3e635] text-zinc-900');
    content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-[#84cc16]');
    
    // Replace indigo accents with lime/green accents
    content = content.replace(/text-indigo-500/g, 'text-[#a3e635]');
    content = content.replace(/text-indigo-600/g, 'text-[#84cc16]');
    content = content.replace(/bg-indigo-500/g, 'bg-[#a3e635]');
    content = content.replace(/bg-indigo-600/g, 'bg-[#84cc16]');
    content = content.replace(/border-indigo-500/g, 'border-[#a3e635]');
    content = content.replace(/border-indigo-600/g, 'border-[#84cc16]');
    content = content.replace(/ring-indigo-500/g, 'ring-[#a3e635]');
    content = content.replace(/bg-indigo-50/g, 'bg-[#f4fce3]'); // lime-50 equiv
    content = content.replace(/text-indigo-700/g, 'text-[#3f6212]'); // lime-700 equiv
    content = content.replace(/border-indigo-100/g, 'border-[#ecfccb]'); // lime-100 equiv
    content = content.replace(/hover:bg-indigo-50/g, 'hover:bg-[#f4fce3]');
    content = content.replace(/hover:text-indigo-600/g, 'hover:text-[#84cc16]');
    content = content.replace(/text-indigo-300/g, 'text-[#bef264]');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
});
