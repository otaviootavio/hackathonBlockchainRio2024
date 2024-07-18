import React, { useState } from "react";
import { api } from "~/utils/api";
import UserProfile from "~/_components/UserProfile";
import { getSession, type GetSessionParams, useSession } from "next-auth/react";
import UserProfileCreate from "~/_components/UserProfileCreate";
import UserProfileEdit from "~/_components/UserProfileEdit";
import { useRouter } from "next/router";

export async function getServerSideProps(
  context: GetSessionParams | undefined,
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

function Profile() {
  const session = useSession();
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  if (!session.data) return <div>Loading...</div>;

  const { data: profile, refetch: refetchProfile } =
    api.userProfile.getUserProfileByUserId.useQuery({
      userId: session.data?.user?.id ?? "",
    });

  const createUserProfile = api.userProfile.createUserProfile.useMutation();

  const handleCreateUserProfile = async (profile: {
    name: string;
    wallet: string;
  }) => {
    await createUserProfile.mutateAsync({
      userId: session.data?.user?.id ?? "",
      ...profile,
    });
    // redirect to rooms
    await router.push("/rooms");
  };

  const edtiUserProfile = api.userProfile.updateUserProfile.useMutation();

  const handleSaveUserProfile = async (profile: {
    name: string;
    wallet: string;
    id: string;
  }) => {
    await edtiUserProfile.mutateAsync({
      ...profile,
    });
    // refetch profile and tunr edit mode off
    await refetchProfile();
    setEditMode(false);
  };

  return (
    <div className="flex h-screen flex-col items-center">
      <div className="min-w-96 p-4">
        <div className="rounded-lg border-2 bg-white p-4">
          <div className="flex justify-between ">
            <h1 className="my-4 text-2xl font-bold">User Profile</h1>
            {editMode ? (
              <button
                onClick={() => setEditMode(false)}
                className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Edit
              </button>
            )}
          </div>
          {profile ? (
            editMode ? (
              <div>
                <UserProfileEdit
                  profile={profile}
                  handleSaveUserProfile={handleSaveUserProfile}
                />
              </div>
            ) : (
              <div>
                <UserProfile profile={profile} />
              </div>
            )
          ) : (
            <UserProfileCreate
              handleCreateUserProfile={handleCreateUserProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
