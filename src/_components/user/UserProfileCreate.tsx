import React, { useState } from "react";
import CreateSignRequest from "../payment/CreateSignRequest";

const UserProfileCreate = ({
  handleCreateUserProfile,
}: {
  handleCreateUserProfile: (profile: { name: string; wallet: string }) => void;
}) => {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  // TODO
  // Handle errors

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateUserProfile({ name, wallet });
      }}
    >
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
          className="focus:shadow-outline rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 focus:outline-none"
        >
          Create
        </button>
        <CreateSignRequest />
      </div>
    </form>
  );
};

export default UserProfileCreate;
