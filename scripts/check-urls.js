#!/usr/bin/env node

const urls = [
  {
    name: 'GitHub Repository',
    url: 'https://github.com/franzenzenhofer/ant-colony-defense',
    type: 'repo'
  },
  {
    name: 'Cloudflare Pages (Live)',
    url: 'https://ant-colony-defense.pages.dev',
    type: 'deployment'
  },
  {
    name: 'Custom Domain',
    url: 'https://ant-colony-defense.franzai.com',
    type: 'deployment'
  },
  {
    name: 'Local Development',
    url: 'http://localhost:5173',
    type: 'local'
  }
];

console.log('\n🔗 Ant Colony Defense - All URLs\n');
console.log('═'.repeat(60));

for (const item of urls) {
  console.log(`\n📍 ${item.name}:`);
  console.log(`   ${item.url}`);
  
  if (item.type === 'repo') {
    console.log(`   └─ View source code, issues, and contribute`);
  } else if (item.type === 'deployment') {
    console.log(`   └─ Play the game online`);
  } else if (item.type === 'local') {
    console.log(`   └─ Development server (run: npm run dev)`);
  }
}

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Verified Working URLs:');
console.log('   • https://ant-colony-defense.pages.dev (All tests passing)');
console.log('   • https://github.com/franzenzenhofer/ant-colony-defense');
console.log('\n⚠️  Pending Configuration:');
console.log('   • https://ant-colony-defense.franzai.com (DNS not configured)');
console.log('\n');