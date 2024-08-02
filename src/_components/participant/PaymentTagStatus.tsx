import { TbCashBanknoteOff, TbCashBanknote } from "react-icons/tb";

const PaymentStatusTag = ({ payed }: { payed: boolean }) => {
  return (
    <div
      className={`inline-flex w-28 items-center justify-start whitespace-nowrap text-sm font-bold ${payed ? "text-green-500" : "text-red-500"}`}
    >
      {payed ? (
        <>
          <TbCashBanknote className="mr-1" />
          Payed
        </>
      ) : (
        <>
          <TbCashBanknoteOff className="mr-1" />
          Not Payed
        </>
      )}
    </div>
  );
};

export default PaymentStatusTag;
