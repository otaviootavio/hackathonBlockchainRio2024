import { TbCashBanknoteOff, TbCashBanknote } from "react-icons/tb";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const PaymentStatusTag = ({ payed }: { payed: boolean }) => {
  return (
    <Badge 
      variant={payed ? "default" : "destructive"} 
      className={cn(
        "flex items-center",
        payed ? "bg-green-500 hover:bg-green-600" : ""
      )}
    >
      {payed ? (
        <>
          <TbCashBanknote className="mr-1" />
          Paid
        </>
      ) : (
        <>
          <TbCashBanknoteOff className="mr-1" />
          Not Paid
        </>
      )}
    </Badge>
  );
};

export default PaymentStatusTag;