
import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
/* import { useNavigate } from 'react-router-dom';
 */import scheduleIcon from '../../Images/schedule.svg';



const Schedule = ({ isOpen, onOpen, onClose }) => {
  const navigate = ` useNavigate()`
  const btnStyles = {
    background: '#fff',
    color: 'rgb(2,43,84)',
    border: '2px solid rgb(2,43,84)',
    borderRadius: '0.15rem',
    width: '250px',
    mt: '1rem',

    _hover: {
      background: '#fff',
    },
    _focus: {
      border: '',
      background: '#fff',
    },
    _active: {
      border: '',
      background: '',
    },
  };

  const colors = {
    primary: 'rgb(2, 43, 84)',
    secondary: 'rgba(2, 43, 84, 0.7)',
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => {
        navigate('/')
      }} isCentered size={'2xl'}>
        <ModalOverlay sx={{ background: 'rgba(2, 43, 84, 0.4)' }} />
        <ModalContent borderRadius={'2px'} h={['auto', '545px']} mx='3vw'>
          <ModalHeader>
            <ModalCloseButton sx={{ color: colors.primary, mt: '.25rem' }} />
          </ModalHeader>
          <ModalBody px='3rem'>
            <Flex
              direction='column'
              align='center'
              gap='1rem'
              textAlign={'center'}
            >
              <Image src={scheduleIcon} width='80px' mt='1rem' />
              <Box
                color={colors.primary}
                fontSize={'1.625rem'}
                fontWeight='bold'
                letterSpacing={'-.01rem'}
                lineHeight='1.46'
              >
                <Text>Thank you!</Text>
                <Text>We will be in touch soon</Text>
              </Box>
              <Text color={colors.secondary}>
                We need a few more details to generate the most accurate rental
                income report. Our team will be contacting you shortly.
              </Text>
              <Text
                color={colors.secondary}
                fontSize={'1rem'}
                letterSpacing='-0.01rem'
                lineHeight={'1.54'}
              >
                Want to speak to us sooner? Call or text us at
                <Text
                  fontWeight={'600'}
                  as='a'
                  href='tel:+1(833) 986-0232'
                  color='rgb(28, 93, 159)'
                >
                  +1 (833) 986-0232
                </Text>{' '}
                or drop us a line at{' '}
                <Text
                  fontWeight={'600'}
                  as='a'
                  href='https://cohostin.com'
                  color='rgb(28, 93, 159)'
                >
                  cohostin.com.
                </Text>{' '}
                You can also schedule a call with us below. Schedule a call
              </Text>
              <Button
                sx={{
                  ...btnStyles,
                }}
              >
                Schedule a call
              </Button>
              <Button
                onClick={() => {
                  navigate('/')
                }}

                variant='ghost'
                sx={{
                  ...btnStyles,
                  color: 'rgb(28, 93, 159)',
                  border: '0',
                  m: '0',
                  _hover: {
                    color: colors.primary,
                  },
                }}
              >
                Ok, got it
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Schedule;
