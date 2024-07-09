import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const router = useRouter();

  const isRootPath = router.pathname === "/";

  if (!isRootPath && status === "unauthenticated") {
    redirect("/");
  }

  if (!isRootPath && status === "loading") {
    return <div>Loading...</div>;
  }

  if (isRootPath || status === "authenticated") {
    return <>{children}</>;
  }

  return null;
};

export default Auth;
