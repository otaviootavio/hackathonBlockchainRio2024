import React, { useState } from "react";
import Link from "next/link";

const UserProfileEdit = ({
  profile,
  handleSaveUserProfile,
}: {
  profile: { name: string | null; wallet: string | null; id: string };
  handleSaveUserProfile: (profile: {
    name: string | null;
    wallet: string | null;
    id: string;
  }) => void;
}) => {
  const [name, setName] = useState(profile.name ?? "");
  const wallet = profile.wallet;

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    handleSaveUserProfile({ name, wallet, id: profile.id });
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <div>
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
      <div>
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
      <div className="flex items-center justify-between">
        <Link href="/update-payment-method/1">
          <button className="rounded bg-red-500 px-2 py-1 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
            Change Wallet
          </button>
        </Link>
      </div>
    </form>
  );
};

export default UserProfileEdit;
