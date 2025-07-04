
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setup() {
  console.log('🚀 AutoPrint College Backend Setup');
  console.log('=====================================\n');

  // Create directories
  const dirs = ['./data', './uploads', './whatsapp-session', './logs'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Check if .env exists
  if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists. Skipping configuration.');
    rl.close();
    return;
  }

  console.log('\n🔧 Configuration Setup\n');

  // Collect configuration
  const port = await question('Server port (default: 3001): ') || '3001';
  const pricePerPage = await question('Price per page in INR (default: 5): ') || '5';
  const pricePerColorPage = await question('Price per color page in INR (default: 10): ') || '10';
  
  console.log('\n💳 Payment Configuration (Razorpay)');
  console.log('You can get these from: https://dashboard.razorpay.com/app/keys\n');
  
  const razorpayKeyId = await question('Razorpay Key ID (optional): ');
  const razorpayKeySecret = await question('Razorpay Key Secret (optional): ');
  
  console.log('\n🖨️  Printer Configuration');
  const defaultPrinter = await question('Default printer name (leave empty for auto-detect): ');
  
  console.log('\n🔐 Security Configuration');
  const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Create .env file
  const envContent = `# AutoPrint College Backend Configuration
# Generated on ${new Date().toISOString()}

# Server Configuration
PORT=${port}
NODE_ENV=development

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-session

# Payment Configuration (Razorpay)
RAZORPAY_KEY_ID=${razorpayKeyId}
RAZORPAY_KEY_SECRET=${razorpayKeySecret}

# Database Configuration
DATABASE_PATH=./data/autoprint.db

# File Storage
UPLOADS_PATH=./uploads
MAX_FILE_SIZE=10485760

# Print Configuration
DEFAULT_PRINTER_NAME=${defaultPrinter}
PRICE_PER_PAGE=${pricePerPage}
PRICE_PER_COLOR_PAGE=${pricePerColorPage}

# Redis Configuration (for local setup)
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=${jwtSecret}
API_KEY=${apiKey}

# WebSocket Configuration
WS_PORT=3002

# URLs
BACKEND_URL=http://localhost:${port}
FRONTEND_URL=http://localhost:5173
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Configuration saved to .env file');

  console.log('\n🎯 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start development server: npm run dev');
  console.log('3. Scan WhatsApp QR code when prompted');
  console.log('4. Configure your printer in Windows settings');
  console.log('5. Test the system with a file upload\n');

  console.log('📖 Important Notes:');
  console.log('- Make sure Redis is installed for queue management');
  console.log('- Adobe Reader or SumatraPDF recommended for PDF printing');
  console.log('- Configure Windows Firewall to allow Node.js connections');
  console.log('- Keep your Razorpay keys secure and never commit them to version control\n');

  rl.close();
}

setup().catch(console.error);
