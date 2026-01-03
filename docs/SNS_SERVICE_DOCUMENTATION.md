# AWS SNS Service Documentation

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [API Endpoints](#api-endpoints)
5. [Push Notifications (FCM)](#push-notifications-fcm)
6. [SMS Notifications](#sms-notifications)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The AWS SNS Service provides two main functionalities:

1. **Push Notifications (GCM)**: Send push notifications directly to mobile devices using Google Cloud Messaging (GCM) through AWS SNS
2. **SMS Notifications**: Send SMS messages directly to phone numbers using AWS SNS

Both services send messages directly without requiring topics or subscriptions, making them ideal for one-to-one communication.

---

## Prerequisites

### AWS Setup

1. **AWS Account**: You need an active AWS account
2. **IAM Credentials**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - IAM user/role with SNS permissions
3. **AWS Region**: Configure your preferred AWS region

### For Push Notifications (GCM)

1. **GCM Platform Application**: Create a GCM Platform Application in AWS SNS
   - Go to AWS SNS Console → Mobile → Push notifications
   - Create platform application → Select GCM (Google Cloud Messaging)
   - Upload your FCM Server Key
   - Note the Platform Application ARN (format: `arn:aws:sns:region:account-id:app/GCM/platform-name`)

### For SMS

1. **SMS Permissions**: Ensure your AWS account has SMS sending permissions
2. **Spend Limits**: Configure SMS spending limits in AWS SNS Console (if required)
3. **Opt-out Lists**: Be aware of opt-out lists for compliance

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Optional: Default GCM Platform Application ARN
AWS_SNS_PLATFORM_APPLICATION_ARN=arn:aws:sns:us-east-1:123456789012:app/GCM/my-app
```

### Required IAM Permissions

Your AWS IAM user/role needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish",
        "sns:CreatePlatformEndpoint",
        "sns:GetEndpointAttributes",
        "sns:SetEndpointAttributes"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## API Endpoints

### Base URL

```
http://localhost:3000/api/aws/sns
```

### Available Endpoints

| Method | Endpoint        | Description                    |
| ------ | --------------- | ------------------------------ |
| POST   | `/publish-push` | Send push notification via GCM |
| POST   | `/send-sms`     | Send SMS to phone number       |

---

## Push Notifications (GCM)

### Endpoint

```
POST /api/aws/sns/publish-push
```

### Description

Sends push notifications directly to mobile devices using GCM. The service automatically creates platform endpoints from device tokens if needed.

### Request Body

| Field                    | Type   | Required | Description                                                                                  |
| ------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `platformApplicationArn` | string | Yes      | GCM Platform Application ARN (format: `arn:aws:sns:region:account-id:app/GCM/platform-name`) |
| `deviceToken`            | string | Yes      | FCM device token or existing endpoint ARN                                                    |
| `message`                | string | Yes      | Notification message body (1-2000 characters)                                                |
| `title`                  | string | No       | Notification title (1-100 characters)                                                        |
| `badge`                  | number | No       | Badge count (integer, ≥ 0)                                                                   |
| `sound`                  | string | No       | Sound file name (1-50 characters, e.g., "default")                                           |
| `customData`             | object | No       | Custom key-value pairs for app logic (values: string, number, or boolean)                    |

### Request Example

```json
{
  "platformApplicationArn": "arn:aws:sns:us-east-1:123456789012:app/GCM/my-app",
  "deviceToken": "fcm-device-token-here",
  "message": "You have a new message!",
  "title": "New Notification",
  "sound": "default",
  "badge": 1,
  "customData": {
    "userId": "12345",
    "orderId": "ORD-789",
    "action": "open_chat",
    "priority": "high"
  }
}
```

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "messageId": "12345678-1234-1234-1234-123456789012",
  "endpointArn": "arn:aws:sns:us-east-1:123456789012:endpoint/FCM/my-app/abc123",
  "message": "Push notification sent successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["platformApplicationArn is required", "deviceToken cannot be empty"]
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Failed to create platform endpoint"
}
```

### cURL Examples

#### Basic Push Notification

```bash
curl -X POST http://localhost:3000/api/aws/sns/publish-push \
  -H "Content-Type: application/json" \
  -d '{
    "platformApplicationArn": "arn:aws:sns:us-east-1:123456789012:app/GCM/my-app",
    "deviceToken": "fcm-device-token-here",
    "message": "Hello from SNS!",
    "title": "Test Notification"
  }'
```

#### Push Notification with Custom Data

```bash
curl -X POST http://localhost:3000/api/aws/sns/publish-push \
  -H "Content-Type: application/json" \
  -d '{
    "platformApplicationArn": "arn:aws:sns:us-east-1:123456789012:app/GCM/my-app",
    "deviceToken": "fcm-device-token-here",
    "message": "Your order has been shipped",
    "title": "Order Update",
    "sound": "default",
    "badge": 1,
    "customData": {
      "orderId": "12345",
      "trackingNumber": "TRACK123",
      "action": "view_order",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'
```

#### Using Existing Endpoint ARN

```bash
curl -X POST http://localhost:3000/api/aws/sns/publish-push \
  -H "Content-Type: application/json" \
  -d '{
    "platformApplicationArn": "arn:aws:sns:us-east-1:123456789012:app/GCM/my-app",
    "deviceToken": "arn:aws:sns:us-east-1:123456789012:endpoint/GCM/my-app/abc123",
    "message": "Quick notification",
    "title": "Alert"
  }'
```

### Field Details

#### `platformApplicationArn`

- **Format**: `arn:aws:sns:region:account-id:app/GCM/platform-name`
- **Example**: `arn:aws:sns:us-east-1:123456789012:app/GCM/my-mobile-app`
- Must be a valid GCM Platform Application ARN created in AWS SNS

#### `deviceToken`

- Can be either:
  - **FCM Device Token**: Raw FCM registration token from the mobile app
  - **Endpoint ARN**: Existing AWS SNS endpoint ARN (format: `arn:aws:sns:region:account-id:endpoint/GCM/platform-name/endpoint-id`)
- If device token is provided, the service automatically creates/retrieves the endpoint ARN

#### `message`

- Main notification text
- Maximum 2000 characters

#### `title`

- Notification title displayed at the top
- Maximum 100 characters

#### `sound`

- Sound file to play when notification arrives
- Use `"default"` for device default sound
- Or specify custom sound file from app resources (e.g., `"notification.mp3"`)

#### `customData`

- Key-value pairs sent in the data payload
- Not displayed in notification UI
- Accessible by your mobile app for handling actions
- Values can be: string, number, or boolean

---

## SMS Notifications

### Endpoint

```
POST /api/aws/sns/send-sms
```

### Description

Sends SMS messages directly to phone numbers. Messages are sent immediately without requiring topics or subscriptions.

### Request Body

| Field         | Type   | Required | Description                                                       |
| ------------- | ------ | -------- | ----------------------------------------------------------------- |
| `phoneNumber` | string | Yes      | Phone number in E.164 format (e.g., `+1234567890`)                |
| `message`     | string | Yes      | SMS message text (1-1600 characters)                              |
| `senderId`    | string | No       | Custom sender ID (1-11 alphanumeric characters, region-dependent) |

### Request Example

```json
{
  "phoneNumber": "+1234567890",
  "message": "Your verification code is 123456",
  "senderId": "MyApp"
}
```

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "messageId": "12345678-1234-1234-1234-123456789012",
  "message": "SMS sent successfully"
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["phoneNumber must be in E.164 format (e.g., +1234567890) with country code"]
}
```

#### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "InvalidParameter: Invalid phone number format"
}
```

### cURL Examples

#### Basic SMS

```bash
curl -X POST http://localhost:3000/api/aws/sns/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Hello! This is a test SMS message."
  }'
```

#### SMS with Sender ID

```bash
curl -X POST http://localhost:3000/api/aws/sns/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Your order #12345 has been confirmed.",
    "senderId": "MyApp"
  }'
```

#### International SMS

```bash
curl -X POST http://localhost:3000/api/aws/sns/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "message": "Welcome to our service!"
  }'
```

### Field Details

#### `phoneNumber`

- **Format**: E.164 international format
- **Required**: Must start with `+` followed by country code
- **Examples**:
  - US: `+1234567890`
  - UK: `+441234567890`
  - India: `+919876543210`
- **Validation**: Regex pattern `/^\+[1-9]\d{1,14}$/`

#### `message`

- SMS text content
- Maximum 1600 characters
- AWS SNS automatically splits longer messages into multiple SMS
- Each SMS segment counts as a separate message for billing

#### `senderId`

- Custom alphanumeric sender ID (1-11 characters)
- **Note**: Not all regions support custom sender IDs
- Check AWS SNS documentation for region-specific support
- If not supported, AWS uses a default sender ID

---

## Error Handling

### Common Error Codes

| Status Code | Description           | Common Causes                                       |
| ----------- | --------------------- | --------------------------------------------------- |
| 400         | Bad Request           | Invalid request body, validation errors             |
| 500         | Internal Server Error | AWS API errors, network issues, invalid credentials |

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": ["Additional error details"] // Only for validation errors
}
```

### Common Errors

#### Push Notification Errors

**Invalid Platform ARN**

```json
{
  "success": false,
  "error": "platformApplicationArn must be for GCM platform (format: arn:aws:sns:region:account-id:app/GCM/platform-name)"
}
```

**Missing Required Fields**

```json
{
  "success": false,
  "error": "platformApplicationArn, deviceToken, and message are required"
}
```

**Endpoint Creation Failed**

```json
{
  "success": false,
  "error": "Failed to create or retrieve endpoint: InvalidParameter: Invalid token"
}
```

#### SMS Errors

**Invalid Phone Number Format**

```json
{
  "success": false,
  "error": "phoneNumber must be in E.164 format (e.g., +1234567890)"
}
```

**Message Too Long**

```json
{
  "success": false,
  "error": "message must not exceed 1600 characters"
}
```

**AWS Credentials Error**

```json
{
  "success": false,
  "error": "The security token included in the request is invalid"
}
```

### Handling Errors in Your Application

```javascript
// Example: Handling push notification errors
try {
  const response = await fetch('/api/aws/sns/publish-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pushData),
  });

  const result = await response.json();

  if (!result.success) {
    if (response.status === 400) {
      // Validation error
      console.error('Validation errors:', result.details);
    } else {
      // Server error
      console.error('Error:', result.error);
    }
  } else {
    console.log('Success! Message ID:', result.messageId);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Best Practices

### Push Notifications

1. **Store Endpoint ARNs**: After the first successful push, store the `endpointArn` from the response. Use it in subsequent requests to avoid recreating endpoints.

2. **Handle Device Token Updates**: Device tokens can change. Implement logic to update endpoint ARNs when tokens change.

3. **Custom Data**: Use `customData` for app-specific logic (navigation, deep links, etc.) rather than parsing the notification message.

4. **Message Length**: Keep messages concise. Long messages may be truncated on some devices.

5. **Error Handling**: Always check for `success: false` and handle errors appropriately.

6. **Rate Limiting**: Implement rate limiting on your side to avoid overwhelming AWS SNS.

### SMS

1. **Phone Number Validation**: Always validate phone numbers on the client side before sending.

2. **Message Length**: Keep messages under 160 characters to avoid multi-part SMS (which costs more).

3. **Opt-out Compliance**: Respect opt-out requests and maintain opt-out lists.

4. **Sender ID**: Test sender ID support in your target regions before using in production.

5. **Cost Management**: Monitor SMS costs. AWS charges per SMS sent.

6. **International Numbers**: Ensure you have the correct country code for international numbers.

7. **Error Handling**: Handle delivery failures gracefully and retry if appropriate.

### Security

1. **Credentials**: Never expose AWS credentials in client-side code.

2. **Rate Limiting**: Implement rate limiting to prevent abuse.

3. **Input Validation**: Always validate and sanitize user inputs.

4. **HTTPS**: Use HTTPS in production to encrypt requests.

5. **IAM Permissions**: Follow the principle of least privilege for IAM permissions.

---

## Troubleshooting

### Push Notifications Not Received

1. **Check Platform ARN**: Verify the Platform Application ARN is correct and for GCM.
2. **Verify Device Token**: Ensure the device token is valid and not expired.
3. **Check AWS Credentials**: Verify AWS credentials have SNS permissions.
4. **Review AWS CloudWatch Logs**: Check SNS logs in AWS Console for detailed errors.
5. **Test Endpoint**: Verify the endpoint ARN is active in AWS SNS Console.

### SMS Not Received

1. **Phone Number Format**: Ensure phone number is in E.164 format with country code.
2. **AWS SMS Limits**: Check if your AWS account has SMS sending enabled and limits configured.
3. **Opt-out Lists**: Verify the phone number is not on an opt-out list.
4. **Region Support**: Some regions have restrictions on SMS. Check AWS documentation.
5. **Spending Limits**: Verify SMS spending limits are not exceeded.

### Common Issues

**Issue**: "InvalidParameter: Invalid token"

- **Solution**: Ensure device token is valid and not expired. Regenerate token in mobile app.

**Issue**: "EndpointDisabled"

- **Solution**: The endpoint may have been disabled. Recreate the endpoint or check endpoint attributes.

**Issue**: "InvalidParameter: Invalid phone number"

- **Solution**: Verify phone number is in E.164 format: `+[country code][number]`

**Issue**: "Throttling: Rate exceeded"

- **Solution**: Implement rate limiting and retry with exponential backoff.

---

## Additional Resources

- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [GCM/FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [AWS SNS Pricing](https://aws.amazon.com/sns/pricing/)

---

## Support

For issues or questions:

1. Check AWS CloudWatch Logs for detailed error messages
2. Review AWS SNS Console for endpoint/application status
3. Verify AWS credentials and IAM permissions
4. Consult AWS SNS documentation for region-specific limitations

---

**Last Updated**: 2024-01-15
