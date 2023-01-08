import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useContext } from 'react';
import stateProvider from '../../context/stateProvider';
import Confirmation from './../../auth/Confirmation';

export const ConfirmationModal = ({ close, values }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { isConfirming } = useContext(stateProvider);
  let confirming = isConfirming;

  const closeModal = () => {
    close()
  };

  return (
    <>
      <Modal
        closeOnOverlayClick={true}
        closeOnEsc
        onClose={closeModal}
        isOpen={confirming}
        isCentered
        motionPreset='scale'
      >
        <ModalOverlay />
        <ModalContent mx='2rem' borderRadius={'24px'}>
          <ModalBody>
            <Confirmation values={values} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
