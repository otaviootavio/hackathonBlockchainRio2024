import React, { useState } from "react";

const UserProfileEdit = ({
  profile,
  handleSaveUserProfile,
}: {
  profile: { name: string; wallet: string; id: string };
  handleSaveUserProfile: (profile: {
    name: string;
    wallet: string;
    id: string;
  }) => void;
}) => {
  const [name, setName] = useState(profile.name);
  const [wallet, setWallet] = useState(profile.wallet);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    handleSaveUserProfile({ name, wallet, id: profile.id });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus:shadow-outline w-full rounded border px-3 py-2 shadow-sm focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Wallet
        </label>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="focus:shadow-outline w-full rounded border px-3 py-2 shadow-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default UserProfileEdit;
