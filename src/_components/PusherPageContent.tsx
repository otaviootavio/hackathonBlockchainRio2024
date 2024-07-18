import React, { useEffect } from "react";
import {
  useSubscribeToEvent,
  useCurrentMemberCount,
  useCurrentMembers,
} from "../_hooks";

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

export default PusherPageContent;
