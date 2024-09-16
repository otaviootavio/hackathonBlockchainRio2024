import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import timeElapsedSince from "~/utils/dateFromNow";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type RoomProps = {
  room: {
    name: string;
    description: string;
    id: string;
    createdAt: Date;
    participants: Array<{
      id: string;
      payed: boolean;
      role: string;
      weight: number;
      roomId: string;
      userId: string;
      profileId: string;
    }>;
  };
};

export function Room({ room }: RoomProps) {
  const router = useRouter();
  const session = useSession();
  const deleteRoom = api.room.deleteRoom.useMutation();
  const rooms = api.room.getRoomsByUserIdInRoom.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const roomOwner = room.participants.find(
    (participant) => participant.role === "owner",
  );

  const handleDeleteRoom = async () => {
    await deleteRoom.mutateAsync({
      id: room.id,
      userId: session.data?.user?.id ?? "",
    });
    await rooms.refetch();
  };

  const handleViewRoom = () => {
    void router.push(`/room/${room.id}`);
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{room.name}</h3>
          <p className="text-sm text-muted-foreground">{room.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {timeElapsedSince(room.createdAt)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewRoom}>
            View
          </Button>
          {roomOwner?.userId === session.data?.user?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the room.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRoom}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
