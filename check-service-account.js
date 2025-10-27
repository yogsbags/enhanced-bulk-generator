const fs = require('fs');

const serviceAccountPath = '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log('📧 Service Account Email:', serviceAccount.client_email);
console.log('🆔 Project ID:', serviceAccount.project_id);
console.log('\n💡 Next step: Add this email to your Google Ads account');
console.log('   Go to: https://ads.google.com → Admin → Access and Security → Add User');
console.log('   Email:', serviceAccount.client_email);
console.log('   Access: Standard or Admin');
