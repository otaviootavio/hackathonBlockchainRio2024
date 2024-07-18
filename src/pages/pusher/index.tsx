import React from "react";
import { useSession } from "next-auth/react";
import { PusherProvider } from "../../_context/pusher/PusherProvider";
import PusherPageContent from "../../_components/PusherPageContent";

const PusherPage = () => {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return <div>Please sign in to use Pusher</div>;
  } else if (status === "loading") {
    return <div>Loading...</div>;
  } else if (status === "authenticated") {
    return (
      <PusherProvider
        slug="your-channel-slug"
        userInfo={{ name: session.user.name ?? "" }}
        userId={session.user.id}
      >
        <PusherPageContent />
      </PusherProvider>
    );
  }
};

export default PusherPage;
