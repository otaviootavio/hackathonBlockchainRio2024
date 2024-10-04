import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import { NavBar } from "~/_components/common/NavBar";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/components/ui/theme-provider";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="bg-background min-h-screen">
            <div className="bg-background mx-auto flex min-h-screen max-w-xl flex-col justify-start shadow-xl">
              <NavBar />
              <div className="flex grow flex-col p-2">
                <Component {...pageProps} />
              </div>
            </div>
          </main>
        </ThemeProvider>
      </div>
      <Toaster />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
