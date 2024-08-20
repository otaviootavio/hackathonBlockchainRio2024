import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  return (
    <div className="flex grow flex-col justify-center">
      <div className="flex flex-col">
        <div className="self-center">
          <Image
            src="/undraw_pizza_sharing_wxop.svg"
            alt="logo"
            width={400}
            height={400}
          />
        </div>
        <div className="flex flex-row items-center justify-center ">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-[4rem]">
            Welcome to
          </div>
        </div>
        <div className="flex  flex-row items-center justify-center ">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-[4rem]">
            XRPizza
          </div>
          <div className="mx-4">
            {status === "authenticated" ? (
              <button
                className="transform rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-semibold text-white transition-transform hover:scale-105"
                onClick={() => void router.push("/rooms")}
              >
                Go to rooms
              </button>
            ) : status === "unauthenticated" ? (
              <button
                className="transform rounded-full bg-gradient-to-r from-green-400 to-blue-500 px-10 py-3 font-semibold text-white transition-transform hover:scale-105"
                onClick={() => void signIn()}
              >
                Sign in!
              </button>
            ) : (
              <button className="rounded-full bg-gradient-to-r from-gray-400 to-gray-600 px-10 py-3 font-semibold text-white">
                Loading...
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-row items-center justify-center text-center text-2xl text-slate-600">
          Split your pizza orders empowered by XRP!
        </div>
      </div>
    </div>
  );
}
