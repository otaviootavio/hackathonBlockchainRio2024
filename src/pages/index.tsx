import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/rooms");
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Pizza314</title>
        <meta
          name="description"
          content="Pizza314 - Split Pizza Ordering App"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Welcome to{" "}
            <span className="text-[hsl(280,100%,70%)]">Pizza314</span>
          </h1>
          <p className="text-2xl text-white">
            The ultimate app for splitting your pizza orders!
          </p>
          <div className="flex flex-col items-center gap-4">
            <button
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={() => void signIn()}
            >
              Sign in to get started
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
