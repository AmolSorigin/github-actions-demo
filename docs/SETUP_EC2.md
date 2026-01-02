# EC2 Setup Instructions

## Step 1: Connect to your EC2 instance

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
# or for Ubuntu:
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

## Step 2: Install Node.js (if not already installed)

For Amazon Linux:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

For Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 3: Install PM2 globally

```bash
sudo npm install -g pm2
```

## Step 4: Create the app directory

```bash
mkdir -p /home/ec2-user/github-actions-demo
# or for Ubuntu:
mkdir -p /home/ubuntu/github-actions-demo
```

## Step 5: Verify installations

```bash
node --version  # Should show v20.x.x
npm --version
pm2 --version
```

## Step 6: Configure PM2 to start on system boot (optional but recommended)

```bash
pm2 startup
# Follow the instructions it provides
```
