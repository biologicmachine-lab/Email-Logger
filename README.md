# Email-Scheduler

A flexible and easy-to-use email scheduling system with CLI tools for quick project setup.

## Quick Start

Create a new Email Scheduler project:

```bash
node packages/cli/scaffold.js
```

This will generate a complete project structure with:
- Configuration files for SMTP and scheduling
- Email templates with variable substitution
- Example scheduled jobs
- Complete documentation

## Features

- 📧 **Email Scheduling**: Schedule emails using cron expressions
- 🎨 **HTML Templates**: Create beautiful emails with variable substitution
- ⚙️ **Easy Configuration**: Simple SMTP setup with environment variables
- 🚀 **Quick Setup**: Scaffold new projects in seconds
- 📝 **Examples Included**: Pre-configured welcome email template and job

## CLI Tools

### Scaffold Tool

Location: `packages/cli/scaffold.js`

Creates a new Email Scheduler project with all necessary files and structure.

**Usage:**
```bash
node packages/cli/scaffold.js
```

**Generated Structure:**
```
my-email-scheduler/
├── config/          # Configuration files
├── templates/       # HTML email templates
├── jobs/           # Email job definitions
├── logs/           # Log directory
├── index.js        # Main scheduler
├── package.json    # Project dependencies
├── .env.example    # Environment template
└── README.md       # Project documentation
```

## License

MIT