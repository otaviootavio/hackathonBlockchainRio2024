import { type ReactNode, useState } from "react";
import { ModalContext, type ModalType, Modal } from "./ModalContext";

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const showModal = (type: ModalType, content: ReactNode) => {
    setModalType(type);
    setModalContent(content);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    setModalContent(null);
    setModalType(null);
  };

  return (
    <ModalContext.Provider
      value={{ showModal, hideModal, isVisible, modalContent, modalType }}
    >
      {children}
      {isVisible && modalType && (
        <Modal isVisible={isVisible} onClose={hideModal} type={modalType}>
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};
