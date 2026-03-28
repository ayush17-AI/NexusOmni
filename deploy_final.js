const { execSync } = require('child_process');

function run(cmd) {
  try {
    console.log(`Executing: ${cmd}`);
    const output = execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return false;
  }
}

// Attempt to alias the latest deployment to the production domains
run('npx -y vercel --prod --yes');
run('npx -y vercel alias set nexus-omni.vercel.app');
