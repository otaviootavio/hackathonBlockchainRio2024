# XRPizza

XRPizz is a aplication build with [T3 Stack](https://create.t3.gg/) that allows users to create rooms and pay for them with XRP. The application is built with Next.js, Prisma, PostgreSQL, Tailwind CSS, tRPC, and Xumm API.

## Key features

- Users can create rooms and join them
- Users can pay for the room with XRP
- Users can pay for the room with XRP
- The owner can see the payment status
- The owner can see the list of participants
- The owner can see the list of rooms
- The owner can delete the room

### Realtime events enabled by [Pusher](https://pusher.com/)

- When a user joins a room, a realtime event is sent to the user
- When a user pays, a realtime event is sent to the room
- When a user pays, a realtime event is sent to the owner

### Login enabled by [NextAuth](https://next-auth.js.org/) and [auth0 by Okta](https://auth0.com/)

We are using [NextAuth](https://next-auth.js.org/) to handle authentication and [auth0 by Okta](https://auth0.com/) to handle user management.

## XRP Mainnet integration

We are using the [Xaman/Xumm Api](https://xumm.readme.io/reference/about) to create payments. The payment process is as follows:

1. Alie register on the website and add their XRPwallet address
2. Alice creates a room with a price in XRP and description
3. Bob joins the room
4. Alice makes the room ready for settlement, wich means that no more modifications can be made to the room
5. Bob generate a payment to Alice's wallet. On the background, the Xumm Api will create the invoice
6. Bob opens the Xaman app and pays the invoice
7. The Xumm Api will send a webhook to XRPizza backend, which will update the payment status
8. End of the process, the room is settled and the payment is done

## Project structure

```bash
.
├── prisma
│   └── schema.prisma
├── public
│   ├── favicon.ico
│   └── undraw_pizza_sharing_wxop.svg
├── README.md
├── src
│   ├── _component
│   │   ├── [...]
│   ├── env.js
│   ├── _hooks
│   │   ├── [...]
│   ├── pages
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth].ts
│   │   │   ├── pusher    // realtime events
│   │   │   │   ├── auth-channel.ts
│   │   │   │   └── auth-user.ts
│   │   │   ├── trpc
│   │   │   │   └── [trpc].ts
│   │   │   └── webhook.ts // XUMM webhook
│   │   [...]
│   ├── server
│   │   ├── api
│   │   │   ├── root.ts
│   │   │   ├── routers
│   │   │   │   ├── participant.ts // participant management
│   │   │   │   ├── post.ts
│   │   │   │   ├── profile.ts     // user profile management
│   │   │   │   ├── room.ts        // room management
│   │   │   │   └── wallet.ts      // wallet management
│   │   │   └── trpc.ts
│   │   ├── auth.ts     // authentication
│   │   ├── db.ts       // database
│   │   └── pusher.ts   // realtime events
│   [...]
[...]
```

## Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

### What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

### Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

### How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Todos and knwon issues

- What happens if the owner deletes the room?
  - While participants are still paying, the owner can't delete the room
  - While there are users viewing the room
- What happens to the user if the owner removes them from the room?
- The user stills can see the detele button in the Rooms page even tho it is not their room
- Even tho the user has not joined the room, they can still listen to the events
- Loading pages are weird
- When the user pays, then exists the page, then join back, the appears as no payed but still has view transaction on block explorer
