import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import https from 'https';

const dir = process.cwd();
const token = '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';
const repoOwner = 'bonieaminrony';
const repoName = 'ishopbd';

async function run() {
  try {
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

    const newBranch = `update-hosting-${Date.now()}`;
    await git.branch({ fs, dir, ref: newBranch });
    await git.checkout({ fs, dir, ref: newBranch });

    console.log(`Created and checked out new branch: ${newBranch}`);

    console.log('Pushing new branch...');
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: newBranch,
      onAuth: () => ({ username: token })
    });
    console.log('Push result:', pushResult);
    
    console.log('Creating Pull Request...');
    
    const prData = JSON.stringify({
      title: 'Update to hosting',
      body: 'Automated PR to update hosting',
      head: newBranch,
      base: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repoOwner}/${repoName}/pulls`,
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': prData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const response = JSON.parse(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Pull Request created successfully! URL: ${response.html_url}`);
          // Now merge it
          mergePR(response.number);
        } else {
          console.error('Failed to create PR:', response);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    req.write(prData);
    req.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

function mergePR(prNumber) {
  console.log(`Merging PR #${prNumber}...`);
  const mergeData = JSON.stringify({
    commit_title: 'Merge update to hosting',
    merge_method: 'squash'
  });

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${repoOwner}/${repoName}/pulls/${prNumber}/merge`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Node.js',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': mergeData.length
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('PR Merged successfully!');
        console.log(response);
      } else {
        console.error('Failed to merge PR:', response);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(mergeData);
  req.end();
}

run();
