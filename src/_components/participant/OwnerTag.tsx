import { CgCrown } from "react-icons/cg";

const OwnerTag = () => {
  return (
    <div className="inline-flex items-center justify-start whitespace-nowrap text-sm font-bold text-blue-500">
      <CgCrown className="mr-1" />
      Owner
    </div>
  );
};

export default OwnerTag;
