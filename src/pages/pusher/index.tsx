import React, { useEffect } from "react";
import {
  PusherProvider,
  useSubscribeToEvent,
  useCurrentMemberCount,
} from "../../utils/pusher";

interface DummyEventData {
  message: string;
}

const PusherPageContent = () => {
  const memberCount = useCurrentMemberCount();

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
    </div>
  );
};

const PusherPage = () => {
  return (
    <PusherProvider slug="your-channel-slug">
      <PusherPageContent />
    </PusherProvider>
  );
};

export default PusherPage;
