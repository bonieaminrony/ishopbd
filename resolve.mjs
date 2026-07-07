import fs from 'fs';

function resolveConflicts(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex matches the conflict block.
  // We want to keep the local part (between <<<<<<< and =======)
  // and discard the remote part (between ======= and >>>>>>>).
  const conflictRegex = /<<<<<<< (.*?)\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> (.*?)\n/g;
  
  const resolvedContent = content.replace(conflictRegex, '$2');
  
  if (content !== resolvedContent) {
    fs.writeFileSync(filePath, resolvedContent, 'utf8');
    console.log(`Resolved conflicts in ${filePath}`);
  } else {
    console.log(`No conflicts found in ${filePath}`);
  }
}

resolveConflicts('src/components/ProductDetails.tsx');
resolveConflicts('src/components/AdminPanel.tsx');
