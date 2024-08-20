import React from "react";

const UserProfile = ({
  profile,
}: {
  profile: { name: string | null; wallet: string | null };
}) => {
  return (
    <div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={profile.name ?? ""}
          disabled
          className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-200 px-3 py-2 text-gray-700 shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Wallet
        </label>
        <input
          type="text"
          value={profile.wallet ?? ""}
          disabled
          className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-200 px-3 py-2 text-gray-700 shadow-sm"
        />
      </div>
    </div>
  );
};

export default UserProfile;
