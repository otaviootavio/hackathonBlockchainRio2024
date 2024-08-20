import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

export function NavBar() {
  const router = useRouter();
  const user = useSession();

  if (user.status === "authenticated") {
    return (
      <nav className="mb-2 bg-gray-50">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center whitespace-nowrap text-2xl font-semibold ">
              XRPizza
            </span>
          </Link>
          <a href="#"></a>
          <ul className="mt-4 flex flex-row gap-4 rounded-lg bg-gray-50 font-medium">
            <li className="flex flex-row ">
              <Link className="text-sm text-blue-800 underline" href="/rooms">
                Rooms
              </Link>
            </li>
            <li className="flex flex-row ">
              <Link className="text-sm text-blue-800 underline" href="/profile">
                Edit Profile
              </Link>
            </li>
            <li className="flex flex-row ">
              {/* TODO: Add logout button */}
              <button
                className="text-sm text-blue-800 underline"
                onClick={async () => {
                  await signOut();
                  await router.push("/");
                }}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="mb-2 bg-gray-50">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <a
            href="#"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            {/* TODO: Add logo */}
            <span className="self-center whitespace-nowrap text-2xl font-semibold ">
              XRPizza
            </span>
          </a>
          <ul className="mt-4 flex flex-row gap-4 rounded-lg bg-gray-50 font-medium">
            <li>
              <p
                className="text-sm text-blue-800 underline"
                onClick={async () => {
                  await signIn();
                  await router.push("/");
                }}
              >
                Sign in
              </p>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}
