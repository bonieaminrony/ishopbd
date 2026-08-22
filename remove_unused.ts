import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles();

sourceFiles.forEach(sourceFile => {
  let changed = false;

  // Fix unused imports
  const importDeclarations = sourceFile.getImportDeclarations();
  importDeclarations.forEach(importDecl => {
    importDecl.getNamedImports().forEach(namedImport => {
      const name = namedImport.getNameNode();
      const symbol = name.getSymbol();
      if (symbol) {
        const references = name.findReferencesAsNodes();
        // If the only reference is the import declaration itself, it's unused.
        if (references.length === 1) {
           namedImport.remove();
           changed = true;
        }
      }
    });

    // Remove empty import declarations
    if (importDecl.getNamedImports().length === 0 && !importDecl.getDefaultImport() && !importDecl.getNamespaceImport() && importDecl.getModuleSpecifierValue().indexOf('.css') === -1) {
       // We keep CSS imports
       if (!importDecl.getText().includes('import "')) {
          importDecl.remove();
          changed = true;
       }
    }
  });

  if (changed) {
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
});
