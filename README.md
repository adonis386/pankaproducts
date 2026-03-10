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

## Stripe CLI (login + webhooks)

1. Install Stripe CLI on Windows (PowerShell):

```bash
winget install --id Stripe.StripeCli --accept-package-agreements --accept-source-agreements
```

2. Open a NEW terminal and authenticate:

```bash
stripe login
```

3. Start webhook forwarding to this app:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the signing secret shown by Stripe CLI and set it in your env:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

5. Trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
```

The app now exposes these Stripe endpoints:

- `POST /api/stripe/embedded-session`
- `POST /api/stripe/webhook`

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
