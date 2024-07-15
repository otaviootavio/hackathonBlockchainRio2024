import React, { useState } from "react";
import GetPaymentStatusForm from "~/_components/GetPaymentStatusForm";
import PaymentStatusResult from "~/_components/PaymentStatusResult";

const GetPaymentStatus: React.FC = () => {
  const [uuid, setUuid] = useState<string | null>(null);

  const handleUuidSubmit = (uuid: string) => {
    setUuid(uuid);
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Get Payment Status</h2>
      <GetPaymentStatusForm onSubmit={handleUuidSubmit} />
      {uuid && <PaymentStatusResult uuid={uuid} />}
    </div>
  );
};

export default GetPaymentStatus;
