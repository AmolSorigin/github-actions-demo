# AWS SES Setup Guide - Step by Step

This guide will walk you through setting up AWS SES (Simple Email Service) to send emails from your Node.js application.

## Prerequisites

- AWS Account with IAM user that has full SES access
- Node.js application (already set up)
- AWS Access Key ID and Secret Access Key for your IAM user

---

## Step 1: AWS IAM User Setup

### 1.1 Verify IAM User Permissions

Your IAM user should have the following policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics",
        "ses:GetAccountSendingEnabled"
      ],
      "Resource": "*"
    }
  ]
}
```

Or use the managed policy: `AmazonSESFullAccess`

### 1.2 Create Access Keys

1. Go to AWS Console → IAM → Users
2. Select your IAM user
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Save the **Access Key ID** and **Secret Access Key** (you won't be able to see the secret again)

---

## Step 2: AWS SES Configuration

### 2.1 Verify Your Email Address (Sandbox Mode)

**Important:** AWS SES starts in **Sandbox Mode**, which means you can only send emails to verified email addresses.

#### For Development/Testing:

1. Go to AWS Console → SES → Verified identities
2. Click "Create identity"
3. Select "Email address"
4. Enter your email address (e.g., `your-email@example.com`)
5. Click "Create identity"
6. Check your email inbox and click the verification link
7. Your email is now verified

#### Verify Recipient Emails (Sandbox Mode):

- You must also verify recipient email addresses in sandbox mode
- Go to SES → Verified identities → Create identity
- Add each recipient email you want to send to
- Verify them via email

### 2.2 Request Production Access (Recommended for Production)

To send emails to any email address:

1. Go to AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form:
   - **Use case description**: Describe how you'll use SES
   - **Website URL**: Your application URL
   - **Expected sending volume**: Estimate your email volume
   - **Compliance**: Answer questions about email compliance
4. Submit the request (usually approved within 24 hours)

### 2.3 Verify Domain (Optional but Recommended)

For production, verify your entire domain:

1. Go to SES → Verified identities → Create identity
2. Select "Domain"
3. Enter your domain (e.g., `example.com`)
4. Choose verification method:
   - **Easy DKIM**: AWS manages DKIM keys
   - **BYO DKIM**: You manage your own keys
5. Add the provided DNS records to your domain's DNS settings
6. Wait for verification (can take up to 72 hours)

---

## Step 3: Node.js Application Configuration

### 3.1 Environment Variables

Create a `.env` file in your project root (copy from `env.example`):

```env
NODE_ENV=development
PORT=3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_SES_FROM_EMAIL=your_verified_email@example.com
```

**Important Notes:**

- `AWS_REGION`: Use the region where you verified your email (e.g., `us-east-1`, `us-west-2`, `eu-west-1`)
- `AWS_ACCESS_KEY_ID`: Your IAM user's access key ID
- `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret access key
- `AWS_SES_FROM_EMAIL`: Must be a verified email address in SES

### 3.2 Find Your AWS Region

1. Go to AWS Console → SES
2. Check the region selector in the top-right corner
3. Common regions:
   - `us-east-1` (N. Virginia)
   - `us-west-2` (Oregon)
   - `eu-west-1` (Ireland)
   - `ap-southeast-1` (Singapore)

---

## Step 4: Testing the API

### 4.1 Start the Server

```bash
npm run dev:dev
```

### 4.2 Send a Test Email

Use curl, Postman, or any HTTP client:

```bash
curl -X POST http://localhost:3000/api/aws/ses/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "This is a test email from AWS SES",
    "isHtml": false
  }'
```

**For HTML Email:**

```bash
curl -X POST http://localhost:3000/api/aws/ses/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test HTML Email",
    "body": "<h1>Hello</h1><p>This is an HTML email</p>",
    "isHtml": true
  }'
```

**Send to Multiple Recipients:**

```bash
curl -X POST http://localhost:3000/api/aws/ses/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["recipient1@example.com", "recipient2@example.com"],
    "subject": "Test Email",
    "body": "This email is sent to multiple recipients"
  }'
```

### 4.3 Expected Response

**Success Response:**

```json
{
  "success": true,
  "messageId": "0100018a-1234-5678-9abc-def012345678-000000",
  "message": "Email sent successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Step 5: Common Issues and Solutions

### Issue 1: "Email address not verified"

**Solution:**

- Verify the sender email in SES Console
- In sandbox mode, also verify recipient emails
- Request production access to send to any email

### Issue 2: "Invalid credentials"

**Solution:**

- Double-check your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Ensure your IAM user has SES permissions
- Verify the credentials are correct in AWS Console

### Issue 3: "Region mismatch"

**Solution:**

- Ensure `AWS_REGION` matches the region where you verified your email
- Check SES Console region selector

### Issue 4: "Sending quota exceeded"

**Solution:**

- In sandbox mode, you can send 200 emails/day and 1 email/second
- Request production access for higher limits
- Check your sending statistics in SES Console

### Issue 5: "Message rejected: Email address is not verified"

**Solution:**

- This happens in sandbox mode when recipient is not verified
- Verify the recipient email or request production access

---

## Step 6: API Endpoint Details

### Endpoint

`POST /api/aws/ses/send-email`

### Request Body

```typescript
{
  to: string | string[];        // Required: Recipient email(s)
  subject: string;               // Required: Email subject
  body: string;                 // Required: Email body (text or HTML)
  from?: string;                // Optional: Sender email (defaults to AWS_SES_FROM_EMAIL)
  replyTo?: string | string[];  // Optional: Reply-to address(es)
  isHtml?: boolean;             // Optional: Set to true for HTML emails (default: false)
}
```

### Example Request

```json
{
  "to": "user@example.com",
  "subject": "Welcome to our service",
  "body": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
  "isHtml": true,
  "replyTo": "support@example.com"
}
```

---

## Step 7: Production Best Practices

1. **Use Environment Variables**: Never hardcode credentials
2. **Error Handling**: Implement proper error handling and logging
3. **Rate Limiting**: Implement rate limiting to avoid hitting SES limits
4. **Email Templates**: Consider using email templates for consistent formatting
5. **Monitoring**: Set up CloudWatch alarms for bounce/complaint rates
6. **DKIM/SPF**: Verify your domain and set up DKIM/SPF records
7. **Bounce Handling**: Implement bounce and complaint handling
8. **SES Configuration Sets**: Use configuration sets for tracking and reputation management

---

## Step 8: Monitoring and Statistics

### View Sending Statistics

1. Go to AWS Console → SES → Sending statistics
2. View:
   - Sending quota
   - Send rate
   - Bounce rate
   - Complaint rate

### Set Up CloudWatch Alarms

1. Go to CloudWatch → Alarms
2. Create alarms for:
   - Bounce rate > threshold
   - Complaint rate > threshold
   - Sending quota usage

---

## Additional Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [Moving Out of SES Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)

---

## Quick Checklist

- [ ] IAM user created with SES permissions
- [ ] Access keys created and saved
- [ ] Sender email verified in SES
- [ ] Recipient emails verified (if in sandbox mode)
- [ ] Production access requested (for production use)
- [ ] `.env` file configured with AWS credentials
- [ ] Correct AWS region set
- [ ] Test email sent successfully

---

## Support

If you encounter issues:

1. Check AWS SES Console for error messages
2. Review CloudWatch logs
3. Verify all credentials and permissions
4. Check SES sending statistics and quotas
