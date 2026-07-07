import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const currentDir = process.cwd();
const tempDir = path.join(currentDir, '.temp_deploy');
const token = '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';
const repoUrl = 'https://github.com/bonieaminrony/ishopbd';

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  let entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.temp_deploy') {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function run() {
  try {
    console.log('Cleaning temp dir...');
    if (fs.existsSync(tempDir)) {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
    await fs.promises.mkdir(tempDir, { recursive: true });

    console.log('Cloning repository...');
    await git.clone({
      fs,
      http,
      dir: tempDir,
      url: repoUrl,
      singleBranch: true,
      depth: 1,
      onAuth: () => ({ username: token })
    });

    console.log('Copying current files over...');
    await copyDir(currentDir, tempDir);

    console.log('Getting status...');
    const status = await git.statusMatrix({ fs, dir: tempDir });
    
    let changed = 0;
    for (const row of status) {
      const [filepath, head, workdir, stage] = row;
      if (workdir !== head || stage !== head) {
        if (workdir === 0) {
          await git.remove({ fs, dir: tempDir, filepath });
        } else {
          await git.add({ fs, dir: tempDir, filepath });
        }
        changed++;
      }
    }

    if (changed === 0) {
      console.log('No changes to commit.');
      return;
    }

    console.log(`Added ${changed} files.`);

    const sha = await git.commit({
      fs,
      dir: tempDir,
      author: {
        name: 'AI Agent',
        email: 'agent@example.com',
      },
      message: 'Update from local'
    });

    console.log(`Committed: ${sha}`);

    const branch = await git.currentBranch({ fs, dir: tempDir });
    console.log(`Current branch: ${branch}`);

    console.log('Pushing...');
    const pushResult = await git.push({
      fs,
      http,
      dir: tempDir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({ username: token })
    });
    console.log('Push result:', pushResult);
    
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
     // try to clean up
     if (fs.existsSync(tempDir)) {
        try { await fs.promises.rm(tempDir, { recursive: true, force: true }); } catch (e) {}
     }
  }
}

run();
