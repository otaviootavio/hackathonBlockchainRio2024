import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const router = useRouter();

  const isRootPath = router.pathname === "/";

  useEffect(() => {
    if (!isRootPath && status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router, isRootPath]);

  if (!isRootPath && status === "loading") {
    return <div>Loading...</div>;
  }

  if (isRootPath || status === "authenticated") {
    return <>{children}</>;
  }

  return null;
};

export default Auth;
