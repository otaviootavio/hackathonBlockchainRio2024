import { CgCrown } from "react-icons/cg";
import { Badge } from "~/components/ui/badge";

const OwnerTag = () => {
  return (
    <Badge variant="secondary" className="flex items-center">
      <CgCrown className="mr-1" />
      Owner
    </Badge>
  );
};

export default OwnerTag;