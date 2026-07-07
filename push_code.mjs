import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();
const token = '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';

async function run() {
  try {
    const branch = await git.currentBranch({ fs, dir });
    console.log(`Current branch: ${branch}`);

    console.log('Pulling...');
    try {
      await git.pull({
        fs,
        http,
        dir,
        ref: branch,
        singleBranch: true,
        author: {
          name: 'AI Agent',
          email: 'agent@example.com',
        },
        onAuth: () => ({ username: token })
      });
      console.log('Pull successful.');
    } catch (pullErr) {
      console.error('Pull failed:', pullErr.message);
      // We will try to proceed anyway just in case
    }

    const status = await git.statusMatrix({ fs, dir });
    
    // Add all changes (modified, added, deleted)
    for (const row of status) {
      const [filepath, head, workdir, stage] = row;
      if (workdir !== head || stage !== head) {
        if (workdir === 0) {
          await git.remove({ fs, dir, filepath });
        } else {
          await git.add({ fs, dir, filepath });
        }
      }
    }

    console.log('Files added.');

    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'AI Agent',
        email: 'agent@example.com',
      },
      message: 'Update to hosting'
    });

    console.log(`Committed: ${sha}`);

    console.log('Pushing...');
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({ username: token })
    });
    console.log('Push result:', pushResult);
    
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
