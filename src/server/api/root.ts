import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { paymentInfoRouter } from "./routers/paymentInfo";
import { userProfileRouter } from "./routers/profile";
import { participantRouter } from "./routers/participant";
import { roomRouter } from "./routers/room";
import { xamanRouter } from "./routers/wallet";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  xaman: xamanRouter,
  post: postRouter,
  room: roomRouter,
  participant: participantRouter,
  userProfile: userProfileRouter,
  paymentInfo: paymentInfoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
