import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { NavBar } from "~/_components/common/NavBar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>XRPizza</title>
        <meta name="description" content="XRPizza - Split Pizza Ordering App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={GeistSans.className}>
        <main className="min-h-screen bg-slate-100">
          <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-start bg-white shadow-xl">
            <NavBar />
            <div className="flex grow flex-col  p-2">
              <Component {...pageProps} />
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
