import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import Lottie from 'lottie-react';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import stateProvider from '../context/stateProvider';
import { db } from '../lib/firebase';
import { sendConfirmationEmail } from '../lib/Mail';
import message from '../lotties/message.json';

const Confirmation = ({ values }) => {
  const navigate = useRouter()
  const [pin, setPin] = useState('');
  const [isVerify, setIsVerify] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { onClose } = useContext(stateProvider);

  const buttonStyles = {
    fontSize: '14px',
    fontWeight: 'semibold',
    // background: '#4F59B9',
    bg: '#000000',
    cursor: 'pointer',
    color: '#FFF',
    borderRadius: '8px',
    _focus: {
      // background: '#FFFF',
    },
    _hover: {
      // background: '#FFFF',
    },
    _active: {
      // background: '#FFFF',
    },
  };

  let pinInputStyle = {
    w: '47px',
    h: '47px',
    bg: '#E6E6E6',
    borderRadius: '6px',
    border: '1px solid #D6D6D6 '
  }

  let handleComplete = async (e) => {
    if (e.length === 4) {

      setIsVerify(true);
      try {
        const usersRef = collection(db, 'users');
        const queryObject = query(usersRef, where('confirmationCode', '==', parseInt(e)));
        const snapshot = await getDocs(queryObject);
        const data = snapshot.docs.map(el => el.data());
        if (data.length) {
          const userRef = doc(db, 'users', data[0].id)
          await updateDoc(userRef, {
            isEmailVerified: true
          })


          const lastId = localStorage.getItem('lastId')
          if (lastId) {
            onClose()
            navigate.push(`/result/${lastId}`)
          }
        } else {
          console.log('User Not found with this Confirmation Code')
        }

      } catch (err) {
        console.log(err)
      }

      setIsVerify(false)

    }

  }

  const handleResend = async () => {
    setIsResending(true);
    const userId = getAuth().currentUser.uid
    try {
      const userRef = doc(db, 'users', userId)
      const random4Number = Math.floor(1000 + Math.random() * 9000);
      // how to get current user to implement the
      const lastId = localStorage.getItem('lastId')
      await updateDoc(userRef, {
        confirmationCode: random4Number
      })
      await sendConfirmationEmail('', values.email, random4Number, lastId);

    } catch (err) {
      console.log(err)
    }
    setIsResending(false)

  }

  const handleRedirect = () => {
    const lastId = localStorage.getItem('lastId');

    if (lastId) {
      onClose()
      navigate.push(`result/${lastId}`)

    } else {
      throw new Error('unable to find lastId of the result');
    }

  }



  return (
    <Flex direction={'column'} gap='0.5rem' pb='1rem'>
      <Lottie
        style={{
          height: '160px',
          width: '160px',
          marginInline: 'auto',
        }}
        animationData={message}
        loop={true}
      />
      {/*       <Box textAlign={'center'}>
        <Text fontSize='29px' color={'#000000'} fontWeight='bold'>
          Congratulation!
        </Text>
        <Text fontSize='16px' color={'#6B6B6B'} fontWeight='bold'>
          Check your email to verify account and view results.
        </Text>
      </Box>
      <HStack mt={1} justify={'center'} w="100%">
        <PinInput placeholder='' onChange={(e) => handleComplete(e)} >
          <PinInputField sx={pinInputStyle} />
          <PinInputField sx={pinInputStyle} />
          <PinInputField sx={pinInputStyle} />
          <PinInputField sx={pinInputStyle} />
        </PinInput>
      </HStack>
      <Flex align={'center'} justify={'flex-end'} m={0}>

        {
          isVerify && (
            <Spinner sx={{
              mt: '-25px'
            }} />
          )
        }
      </Flex> */}
      <Box textAlign={'center'}>
        <Text fontWeight={'600'} fontFamily={'GTBold'} fontSize={'30px'}>Congratulation!</Text>
        <Text fontWeight={600} fontFamily={'GTBold'} color={'#6B6B6B'} fontSize={'18px'}>We've emailed your results to you.  </Text>

      </Box>
      <Button
        isLoading={isResending}
        alignSelf={'center'}
        sx={{
          ...buttonStyles,
          mt: '0.5rem',
          mb: '1rem'
        }}

        onClick={handleRedirect}
      >
        View Result


      </Button>
    </Flex>
  );
};

export default Confirmation;
