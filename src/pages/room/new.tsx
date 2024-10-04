import { getSession } from "next-auth/react";
import { type GetServerSideProps } from "next";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import { db } from "~/server/db";

export default function NewRoom() {
  const [name, setName] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [participantPayed] = useState(true);
  const createRoom = api.room.createRoom.useMutation();
  const router = useRouter();
  const session = useSession();
  const userProfile = api.userProfile.getUserProfileByUserId.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const handleSubmit = async () => {
    await createRoom
      .mutateAsync({
        name,
        totalPrice,
        description,
        participantName: userProfile.data?.name ?? "",
        participantPayed: participantPayed,
        userId: session.data?.user?.id ?? "",
        profileId: userProfile.data?.id ?? "",
      })
      .then(async () => {
        await router.push("/rooms");
      });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
          <CardDescription>
            You will be the owner of this room. We consider that you paid for
            the pizza today!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomPrice">Pizza Price (in XRP)</Label>
            <Input
              id="roomPrice"
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              placeholder="Enter pizza price"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomDescription">Room Description</Label>
            <Textarea
              id="roomDescription"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Enter room description"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit}>Create Room</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const userProfile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile?.id) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return {
    props: { session, userProfile },
  };
};
