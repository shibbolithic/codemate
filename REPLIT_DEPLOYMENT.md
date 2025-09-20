# CodeMate Replit Deployment Guide

## Overview
This guide will help you deploy CodeMate to Replit and configure GitHub webhooks to automatically analyze pull requests.

## Prerequisites
- Replit account
- GitHub repository with admin access
- GitHub Personal Access Token

## Step 1: Deploy to Replit

### 1.1 Create New Repl
1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your repository URL: `https://github.com/yourusername/codemate`
5. Click "Import"

### 1.2 Configure Environment Variables
1. In your Repl, click on the "Secrets" tab (lock icon in the sidebar)
2. Add the following environment variables:

```
GITHUB_TOKEN=your_github_personal_access_token
WEBHOOK_SECRET=your_random_secret_string
```

**To get a GitHub token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`, `write:discussion`
4. Copy the generated token

**To generate a webhook secret:**
```bash
# Generate a random secret (run in terminal)
openssl rand -hex 32
```

### 1.3 Install Dependencies
The Repl will automatically install dependencies from `requirements.txt`. If it doesn't:
1. Open the Shell tab
2. Run: `pip install -r requirements.txt`

### 1.4 Run the Server
1. Click the "Run" button
2. The server will start on the provided URL (e.g., `https://your-repl-name.your-username.repl.co`)

## Step 2: Configure GitHub Webhook

### 2.1 Set Up Webhook in GitHub
1. Go to your GitHub repository
2. Click "Settings" → "Webhooks" → "Add webhook"
3. Configure the webhook:
   - **Payload URL**: `https://your-repl-name.your-username.repl.co/webhook`
   - **Content type**: `application/json`
   - **Secret**: Use the same secret you set in Replit
   - **Events**: Select "Pull requests"
   - **Active**: ✅ Checked

### 2.2 Test the Webhook
1. Create a test pull request in your repository
2. Check the Repl console for webhook logs
3. You should see analysis results posted as PR comments

## Step 3: Verify Deployment

### 3.1 Health Check
Visit your Repl URL in a browser. You should see:
```json
{"message": "Codemate webhook server running"}
```

### 3.2 Test Webhook Endpoint
You can test the webhook endpoint using curl:
```bash
curl -X POST https://your-repl-name.your-username.repl.co/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{"action": "opened", "repository": {"full_name": "test/repo"}, "pull_request": {"number": 1}}'
```

## Step 4: Monitor and Debug

### 4.1 View Logs
- Check the Repl console for real-time logs
- Look for error messages or successful webhook processing

### 4.2 Common Issues
- **Webhook not receiving events**: Check the webhook URL and secret
- **Analysis failing**: Verify GitHub token has correct permissions
- **Dependencies missing**: Run `pip install -r requirements.txt` in the Shell

## Step 5: Customize Configuration

### 5.1 Environment Variables
You can customize the following in Replit Secrets:
- `GITHUB_TOKEN`: Your GitHub personal access token
- `WEBHOOK_SECRET`: Secret for webhook verification
- `DEBUG`: Set to `true` for verbose logging
- `CI_MODE`: Set to `true` for CI/CD environments

### 5.2 Analyzer Configuration
The server runs the following analyzers by default:
- **Lint Analyzer**: Code style and syntax checking
- **Security Analyzer**: Security vulnerability scanning

## Security Notes
- Keep your GitHub token secure and never commit it to version control
- Use a strong, random webhook secret
- Consider using GitHub App instead of personal access token for production

## Troubleshooting

### Server Won't Start
- Check that all dependencies are installed
- Verify Python version compatibility
- Check the Repl console for error messages

### Webhook Not Working
- Verify the webhook URL is correct
- Check that the webhook secret matches
- Ensure the repository has the correct permissions

### Analysis Not Running
- Verify the GitHub token has `repo` scope
- Check that the repository is accessible
- Look for error messages in the console

## Support
If you encounter issues:
1. Check the Repl console logs
2. Verify your GitHub token permissions
3. Test the webhook endpoint manually
4. Check the GitHub webhook delivery logs in your repository settings
