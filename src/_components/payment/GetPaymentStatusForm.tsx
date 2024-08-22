import React, { useState } from "react";

interface GetPaymentStatusFormProps {
  onSubmit: (uuid: string) => void;
}

const GetPaymentStatusForm: React.FC<GetPaymentStatusFormProps> = ({
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const uuidInput = form.elements.namedItem("uuid") as HTMLInputElement;
    setLoading(true);
    onSubmit(uuidInput.value);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">UUID:</label>
        <input
          name="uuid"
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
      >
        {loading ? "Loading..." : "Get Status"}
      </button>
    </form>
  );
};

export default GetPaymentStatusForm;
