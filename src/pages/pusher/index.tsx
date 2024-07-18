import React, { use, useEffect } from "react";
import {
  PusherProvider,
  useSubscribeToEvent,
  useCurrentMemberCount,
  useCurrentMembers,
} from "../../utils/pusher";
import { useSession } from "next-auth/react";

interface DummyEventData {
  message: string;
}

const PusherPageContent = () => {
  const memberCount = useCurrentMemberCount();
  const members = useCurrentMembers();

  useSubscribeToEvent<DummyEventData>("dummy-event", (data) => {
    console.log("Received dummy event:", data);
  });

  useEffect(() => {
    console.log("Component mounted");
  }, []);

  return (
    <div>
      <h1>Pusher Demo Page</h1>
      <p>Current Member Count: {memberCount}</p>
      <p>Current Members:</p>
      <ul>
        {members.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

const PusherPage = () => {
  const session = useSession();

  if (session.status === "unauthenticated") {
    return <div>Please sign in to use Pusher</div>;
  } else if (session.status === "loading") {
    return <div>Loading...</div>;
  } else if (session.status === "authenticated") {
    return (
      <PusherProvider
        slug="your-channel-slug"
        userInfo={{ name: session.data.user.name ?? "" }}
        userId={session.data.user.id}
      >
        <PusherPageContent />
      </PusherProvider>
    );
  }
};

export default PusherPage;
