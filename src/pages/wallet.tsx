import CreatePayment from "~/_components/CreatePayment";
import GetPaymentStatus from "~/_components/GetPaymentStatus";

const WalletPage: React.FC = () => {
  return (
    <div className="max-w-96 p-8">
      <h1 className="mb-8 text-2xl font-bold">Wallet Operations</h1>
      <div className="grid grid-cols-1 gap-8">
        <CreatePayment />
        <GetPaymentStatus />
      </div>
    </div>
  );
};

export default WalletPage;
