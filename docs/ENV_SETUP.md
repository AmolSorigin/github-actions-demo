# Environment Variables Setup Guide

## Overview

The deployment workflow automatically creates a `.env` file on your EC2 instance from GitHub Secrets. This ensures sensitive environment variables are not committed to your repository.

## Required GitHub Secret

You need to add one more secret to your GitHub repository:

### `EC2_ENV_FILE`

This secret should contain the **entire contents** of your `.env` file that will be created on EC2.

## How to Set It Up

### Step 1: Create your .env file content

Based on your `env.example` file, create the content for your production environment:

```bash
NODE_ENV=production
PORT=3000
# Add any other environment variables you need
# DATABASE_URL=your_database_url
# API_KEY=your_api_key
```

### Step 2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EC2_ENV_FILE`
5. Value: Paste the entire content of your `.env` file (all variables, one per line)
6. Click **Add secret**

### Example Secret Value:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
API_KEY=your_secret_api_key_here
```

## How It Works

1. During deployment, the workflow creates a `.env` file on EC2
2. The file is created in your app directory (`${{ secrets.EC2_APP_PATH }}`)
3. The app reads this `.env` file at startup using `dotenv`
4. The `.env` file is **never** committed to git (it's in `.gitignore`)

## Security Notes

- ✅ Environment variables are stored securely in GitHub Secrets
- ✅ The `.env` file is created only on EC2, not in your repository
- ✅ The `.env` file is excluded from the deployment archive
- ⚠️ Make sure your EC2 instance has proper security groups configured
- ⚠️ Never commit `.env` files to your repository

## Updating Environment Variables

To update environment variables:

1. Go to GitHub → Settings → Secrets → Actions
2. Find `EC2_ENV_FILE`
3. Click **Update**
4. Modify the content
5. Push a new commit to `dev` branch to trigger redeployment

## Current Environment Variables Used

Based on `src/config/env.ts`, your app currently uses:

- `NODE_ENV` - Environment mode (production/development)
- `PORT` - Server port (defaults to 3000 if not set)

Add more variables as needed for your application!
