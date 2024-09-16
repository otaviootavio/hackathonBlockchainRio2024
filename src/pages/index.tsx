import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

type HomeProps = {
  isAuthenticated: boolean;
};

export default function Home({ isAuthenticated }: HomeProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-6xl">
          <div>Welcome to XRPizza</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="self-center">
          <Image
            src="/undraw_pizza_sharing_wxop.svg"
            alt="logo"
            width={300}
            height={300}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={() => {
                  if (isAuthenticated) {
                    void router.push("/rooms");
                  } else {
                    void signIn();
                  }
                }}
              >
                {isAuthenticated ? "Go to rooms" : "Sign in!"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isAuthenticated
                  ? "View available rooms"
                  : "Sign in to get started"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-muted-foreground text-center text-xl">
          Split your pizza orders empowered by XRP!
        </p>
      </CardContent>
    </Card>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context,
) => {
  const session = await getSession(context);

  return {
    props: {
      isAuthenticated: !!session,
    },
  };
};
