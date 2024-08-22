import React, { createContext, type ReactNode } from "react";
import { MdClose } from "react-icons/md";
// Define the types for our modal
export type ModalType = "alert" | "warn" | "info";

export interface ModalContextType {
  showModal: (type: ModalType, content: ReactNode) => void;
  hideModal: () => void;
  isVisible: boolean;
  modalContent: ReactNode | null;
  modalType: ModalType | null;
}

// Create the context
export const ModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

// Custom Modal component
interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: ModalType;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  type,
  children,
}) => {
  if (!isVisible) return null;

  const typeStyles = {
    alert: "bg-slate-50 border border-red-500 text-red-700",
    warn: "bg-slate-50 border border-yellow-500 text-yellow-700",
    info: "bg-slate-50 border border-blue-500 text-blue-700",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`rounded-lg  shadow-lg ${typeStyles[type]} border-2`}>
        <div className="flex h-full w-full flex-col p-2">
          <div
            onClick={onClose}
            className={`self-end  rounded-xl p-1   hover:bg-slate-100`}
          >
            <MdClose />
          </div>
          <div>
            <div className="mb-4 p-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
