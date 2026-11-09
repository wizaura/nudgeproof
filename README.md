This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google sign-in setup

Google sign-in uses Supabase Auth's OAuth flow and returns through `/auth/callback`.

1. In Supabase, enable Google under **Authentication → Sign In / Providers** and add the Google OAuth client ID and secret.
2. Set the Supabase **Site URL** to the production app origin and allow `http://localhost:3000/auth/callback` plus `https://your-domain.com/auth/callback` in **Authentication → URL Configuration**.
3. In Google Cloud's OAuth client, add your app origins (for example `http://localhost:3000` and `https://your-domain.com`). Set the authorized redirect URI to the Supabase callback URL shown on the Google provider settings page.

Supabase redirects back to the app callback, which exchanges the OAuth code for the same cookie-backed session used by email/password authentication.

## Password recovery setup

Password reset uses `/auth/recovery/callback` to exchange the recovery code, then opens `/reset-password`. Add `http://localhost:3000/auth/recovery/callback` and `https://your-domain.com/auth/recovery/callback` to the Supabase redirect allow list. If the recovery email template is customized, its link should use `{{ .ConfirmationURL }}` so Supabase verifies the token and honors the requested callback.

Supabase controls recovery-link expiry through **Authentication → Sign In / Providers → Email → Email OTP Expiration**. Set this to `3600` seconds (one hour). This shared setting also controls expiry for other Supabase email links and OTPs.

## Resend SMTP for Supabase Auth

Supabase Auth sends password recovery, signup, and other auth emails through its configured SMTP service. To use Resend, configure it in the Supabase Dashboard; do not add the Resend API key to the Next.js app environment.

1. In Resend, add and verify the sending domain. Publish the DNS records Resend provides, then create an API key with permission to send email.
2. In Supabase, open **Authentication → Emails → SMTP Settings**, enable custom SMTP, and enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: the Resend API key
   - Sender email: a verified address on your domain, such as `auth@your-domain.com`
   - Sender name: `NudgeProof`
3. Save the SMTP settings and use **Send test email** if available. Then check **Authentication → Rate Limits** and adjust the auth email limit to match your Resend account limits and expected traffic.

Resend SMTP credentials are managed in Supabase, while Supabase continues to generate and validate recovery tokens. The per-user recovery request cooldown remains a separate Supabase Auth rate limit.

## Store integrations

The dashboard integrations page can register verified order webhooks for Shopify and WooCommerce, and includes a NudgeProof WordPress plugin for signup and paid-order events.

- **Shopify:** Create a Shopify custom app with `write_webhooks` access (and access to order webhooks). Set the app's client secret as the server-only `SHOPIFY_API_SECRET` environment variable in local development and production. In NudgeProof, enter the store's `.myshopify.com` domain and an Admin API access token; the token is used to register the webhook and is not saved. Shopify deliveries are verified with the app secret.
- **WooCommerce:** Create a REST API key with Read/Write access. In NudgeProof, enter the store URL, consumer key, and consumer secret. The credentials are used only to register an `order.updated` webhook; the site webhook secret signs deliveries. Only orders in `processing` or `completed` status create purchase events.
- **WordPress:** Download the plugin from the Integrations page, upload and activate it in WordPress, then enter the selected NudgeProof website's webhook URL and secret in **Settings → NudgeProof**. It sends new WordPress user registrations. Use the dedicated WooCommerce connection for paid order events to avoid duplicate purchases.

The app's `NEXT_PUBLIC_APP_URL` must point to the reachable public NudgeProof origin in production so providers can deliver webhooks. Stripe remains unavailable.
