#!/usr/bin/env node

/**
 * Email Scheduler - Scaffold Script
 * 
 * This script creates a new Email Scheduler project with all necessary
 * configuration files, directory structure, and example templates.
 */

const fs = require('fs');
const path = require('path');

// Check if dependencies are available
let inquirer, chalk, ora;
try {
  inquirer = require('inquirer');
  chalk = require('chalk');
  ora = require('ora');
} catch (err) {
  console.log('Installing required dependencies...');
  console.log('This is a one-time setup. Please run: npm install');
  console.log('\nAlternatively, this scaffold can run without dependencies.');
}

/**
 * Main scaffold function
 */
async function scaffold() {
  console.log('\n' + (chalk ? chalk.bold.blue('📧 Email Scheduler - Project Scaffolding') : '📧 Email Scheduler - Project Scaffolding'));
  console.log((chalk ? chalk.gray('━'.repeat(50)) : '━'.repeat(50)) + '\n');

  let projectName = 'my-email-scheduler';
  let projectPath = path.join(process.cwd(), projectName);

  // Get user input if inquirer is available
  if (inquirer) {
    const answers = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-email-scheduler',
        validate: (input) => {
          if (/^[a-zA-Z0-9-_]+$/.test(input)) {
            return true;
          }
          return 'Project name can only contain letters, numbers, hyphens, and underscores.';
        }
      },
      {
        type: 'input',
        name: 'projectPath',
        message: 'Project location:',
        default: (answers) => path.join(process.cwd(), answers.projectName)
      },
      {
        type: 'confirm',
        name: 'createExamples',
        message: 'Include example templates and jobs?',
        default: true
      }
    ]);

    projectName = answers.projectName;
    projectPath = answers.projectPath;
  } else {
    console.log('Project name: my-email-scheduler');
    console.log('Project location: ' + projectPath);
  }

  const spinner = ora ? ora('Creating project structure...').start() : null;

  try {
    // Create directory structure
    const directories = [
      projectPath,
      path.join(projectPath, 'config'),
      path.join(projectPath, 'templates'),
      path.join(projectPath, 'jobs'),
      path.join(projectPath, 'logs')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    if (spinner) spinner.text = 'Creating configuration files...';

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: 'Email Scheduler Project',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: ['email', 'scheduler'],
      author: '',
      license: 'MIT',
      dependencies: {
        'node-cron': '^3.0.2',
        'nodemailer': '^6.9.7',
        'dotenv': '^16.3.1'
      }
    };

    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create .env.example
    const envExample = `# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Scheduler Configuration
TIMEZONE=America/New_York
LOG_LEVEL=info
`;

    fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);

    // Create config file
    const configJs = `require('dotenv').config();

module.exports = {
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  scheduler: {
    timezone: process.env.TIMEZONE || 'America/New_York',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};
`;

    fs.writeFileSync(path.join(projectPath, 'config', 'config.js'), configJs);

    if (spinner) spinner.text = 'Creating example templates...';

    // Create example email template
    const welcomeTemplate = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Thank you for signing up! We're excited to have you on board.</p>
      <p>This is an example email template that you can customize for your needs.</p>
    </div>
    <div class="footer">
      <p>This email was sent by Email Scheduler</p>
    </div>
  </div>
</body>
</html>
`;

    fs.writeFileSync(path.join(projectPath, 'templates', 'welcome.html'), welcomeTemplate);

    // Create example job
    const exampleJob = `const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

async function sendWelcomeEmail(recipient) {
  // Create transporter
  const transporter = nodemailer.createTransport(config.email);

  // Read template
  let template = fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'welcome.html'),
    'utf8'
  );

  // Replace variables
  template = template.replace('{{name}}', recipient.name);

  // Send email
  const info = await transporter.sendMail({
    from: config.email.auth.user,
    to: recipient.email,
    subject: 'Welcome to Email Scheduler!',
    html: template
  });

  console.log(\`Welcome email sent to \${recipient.email}: \${info.messageId}\`);
  return info;
}

module.exports = { sendWelcomeEmail };
`;

    fs.writeFileSync(path.join(projectPath, 'jobs', 'welcome-email.js'), exampleJob);

    // Create main index.js
    const indexJs = `const cron = require('node-cron');
const config = require('./config/config');
const { sendWelcomeEmail } = require('./jobs/welcome-email');

console.log('Email Scheduler Started');
console.log('Timezone:', config.scheduler.timezone);

// Example: Send welcome email every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled job: Welcome Email');
  
  // Example recipient - replace with your logic to get recipients
  const recipient = {
    name: 'John Doe',
    email: 'example@example.com'
  };

  try {
    await sendWelcomeEmail(recipient);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}, {
  timezone: config.scheduler.timezone
});

console.log('Scheduled jobs configured. Press Ctrl+C to exit.');

// Keep the process running
process.stdin.resume();
`;

    fs.writeFileSync(path.join(projectPath, 'index.js'), indexJs);

    // Create README
    const readme = `# ${projectName}

Email Scheduler project created with Email Scheduler CLI.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure your email settings:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Edit \`.env\` with your SMTP credentials.

3. Run the scheduler:
   \`\`\`bash
   npm start
   \`\`\`

## Project Structure

- \`config/\` - Configuration files
- \`templates/\` - Email templates (HTML)
- \`jobs/\` - Email job definitions
- \`logs/\` - Log files
- \`index.js\` - Main scheduler entry point

## Scheduling

This project uses \`node-cron\` for scheduling. Edit \`index.js\` to configure your schedule.

Cron format: \`* * * * *\`
- Minute (0-59)
- Hour (0-23)
- Day of Month (1-31)
- Month (1-12)
- Day of Week (0-7)

Examples:
- \`0 9 * * *\` - Every day at 9:00 AM
- \`0 */2 * * *\` - Every 2 hours
- \`0 9 * * 1\` - Every Monday at 9:00 AM

## Email Templates

HTML templates support variable substitution using \`{{variableName}}\` syntax.

## License

MIT
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    // Create .gitignore
    const gitignore = `node_modules/
.env
logs/*.log
*.log
.DS_Store
`;

    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

    if (spinner) {
      spinner.succeed((chalk ? chalk.green('✓ Project created successfully!') : '✓ Project created successfully!'));
    } else {
      console.log('\n✓ Project created successfully!');
    }

    // Print success message
    console.log('\n' + (chalk ? chalk.bold('Next steps:') : 'Next steps:'));
    console.log((chalk ? chalk.cyan(`  cd ${projectName}`) : `  cd ${projectName}`));
    console.log((chalk ? chalk.cyan('  npm install') : '  npm install'));
    console.log((chalk ? chalk.cyan('  cp .env.example .env') : '  cp .env.example .env'));
    console.log((chalk ? chalk.cyan('  # Edit .env with your email credentials') : '  # Edit .env with your email credentials'));
    console.log((chalk ? chalk.cyan('  npm start') : '  npm start'));
    console.log('');

  } catch (error) {
    if (spinner) spinner.fail((chalk ? chalk.red('Error creating project') : 'Error creating project'));
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the scaffold
if (require.main === module) {
  scaffold().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { scaffold };
