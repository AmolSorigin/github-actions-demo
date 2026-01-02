export interface SendEmailParams {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
  replyTo?: string | string[];
  isHtml?: boolean;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
