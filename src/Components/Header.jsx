import { Button, Flex, Text, Box, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/react'
import { getAuth, signOut } from 'firebase/auth';
import React from 'react'
import { useContext } from 'react';
import { useCookies } from 'react-cookie';
import Confirmation from './../auth/Confirmation';
import Login from './../auth/Login';
import Signup from './../auth/Signup';
import ForgotPassword from './../Components/ForgotPassword';

import { ConfirmationModal } from './../Components/modals/ConfirmationModal';
import HistoryModal from './../Components/modals/HistoryModal';
import { LoginModal } from './../Components/modals/LoginModal';
import stateProvider from './../context/stateProvider';
let FontFamily = 'GTBold'

export const Header = ({ isOpen: isSignUpOpen, onOpen: onSignupOpen, onClose: onSignupClose, onSuccessClose, onSuccessModal, isSuccessModal }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['hasSubmitForm']);

    const {

        values,
        setValues,
        currentUser,
        setIsItFromHeader

    } = useContext(stateProvider);
    const { isOpen: isForgotPassword, onOpen: onForgotPassword, onClose: onForgotClose } = useDisclosure();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: is, onOpen: on, onClose: close } = useDisclosure();

    const handleLoginModal = () => {
        onSignupClose();
        onOpen()
    }
    const handleSignModal = () => {
        onClose();
        onSignupOpen()
    }

    const handleForgotPassword = () => {
        onClose();
        onForgotPassword()
    }

    const handleSignout = () => {
        const auth = getAuth();
        signOut(auth);
        removeCookie('hasSubmitForm')
    }

    return (
        <Flex fontFamily={'GTMedium'} px={'30px'} py={'10px'} alignItems={'center'} justifyContent={'space-between'} boxShadow={'0 1px 6px rgb(158 157 164 / 21%)'}>
            <Box>
                <Text>revenue<strong>bnb</strong></Text>
            </Box>
            <Box>
                {
                    currentUser && Object.keys(currentUser).length ? (
                        <Box>
                            <Button variant={'ghost'} onClick={handleSignout} >Logout</Button>
                            <Button onClick={on} fontFamily={FontFamily} bg={'#f722db'} color={'white'}>Account</Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button variant={'ghost'} onClick={() => {
                                setIsItFromHeader(true)
                                onOpen()
                            }} >Login</Button>
                            <Button onClick={() => {
                                setIsItFromHeader(true);
                                onSignupOpen()

                            }} fontFamily={FontFamily} bg={'#f722db'} color={'white'}>Sign up</Button>
                        </Box>

                    )
                }
            </Box>


            <Modal onClose={onSignupClose} isOpen={isSignUpOpen} isCentered motionPreset='scale'>
                <ModalOverlay />
                <ModalContent mx='2rem' borderRadius={'24px'}>
                    <ModalBody>
                        <Signup values={values}
                            setValues={setValues}
                            handleLoginModal={handleLoginModal}
                            v={{
                                isSignUpOpen, onSignupOpen, onSignupClose
                            }}
                            onSuccessModal={onSuccessModal} />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal onClose={onClose} isOpen={isOpen} isCentered motionPreset='scale'>
                <ModalOverlay />
                <ModalContent mx='2rem' borderRadius={'24px'}>
                    <ModalBody>
                        <Login

                            handleForgotPassword={handleForgotPassword}
                            handleSignModal={handleSignModal}
                            onClose={onClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal onClose={onForgotClose} isOpen={isForgotPassword} isCentered motionPreset='scale'>
                <ModalOverlay />
                <ModalContent mx='2rem' borderRadius={'24px'}>
                    <ModalBody>
                        <ForgotPassword />

                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal onClose={onSuccessClose} isOpen={isSuccessModal} isCentered motionPreset='scale'>
                <ModalOverlay />
                <ModalContent mx='2rem' borderRadius={'24px'}>
                    <ModalBody>
                        <Confirmation />

                    </ModalBody>
                </ModalContent>
            </Modal>
            <HistoryModal isOpen={is} onClose={close} />

        </Flex>
    )
}
