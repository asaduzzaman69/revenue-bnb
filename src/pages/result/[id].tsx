import { Box, Button, Flex, Image, Input, Progress, Text, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { arrayUnion, doc, getFirestore, updateDoc } from 'firebase/firestore';
import Lottie from 'lottie-react';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import graph from './../../lotties/graph.json';
import Schedule from './../../Components/modals/schedule';
import LogoItem from './../../Components/UI/LogoItem';
import stateProvider from './../../context/stateProvider';
import { syncAirtable } from './../../lib/airtable';
import { db } from './../../lib/firebase';
import { anualReportAndMonthlyBreakdown } from './../../lib/rapidApi';
import { formateNightlyData, getReportDetails } from './../../lib/reports';
import errorAnimation from './../../lotties/error.json';
import Breakdown from './../../Components/Breakdown';
import PhoneNumber from './../../Components/PhoneNumber';
import Price from './../../Components/PropertyDetails/Price';
import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useCookies } from 'react-cookie';
import CustomInput from './../../Components/UI/CustomInput'
import { BiUserCircle } from 'react-icons/bi';
import { MdAlternateEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { v4 as uuidv4 } from 'uuid';
import { useForm, Controller } from "react-hook-form";
import { useRouter } from 'next/router';
import Head from 'next/head';

export const ResultContext = createContext(null);


const Result: FC<any> = ({ data }) => {
    let defaultValues = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        "User ID": uuidv4()
    };
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true)
    const { control, formState: { errors }, handleSubmit, reset, watch, setValue, } = useForm({ defaultValues });

    let watchr = watch(['phone'])
    const router = useRouter();
    const { id } = router.query
    const { monthlyData, currentUser, onClose } = useContext(stateProvider);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [isNightlyGenarating, setIsNightlyGenarating] = useState(true);
    const [expense, setExpense] = useState({});
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState({
        isError: false,
        errorMessage: '',
    });
    const [cookies, setCookie, removeCookie] = useCookies(['hasSubmitForm']);
    const [cookiesFormData, setCookiesFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        "User ID": uuidv4()
    });
    const [isCookiesLoading, setIsCookiesLoading] = useState(false)

    const { firstName, lastName, phone, email } = cookiesFormData
    const [isLargerThan1200] = useMediaQuery('(min-width: 1200px)');
    const [isLargerThan1600] = useMediaQuery('(min-width: 1600px)');
    const [isLargerThan1100] = useMediaQuery('(min-width: 1100px)');

    const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
    const handleSetCookie = () => {
        let watcher = watch(['phone', 'firstName', 'lastName', 'email', 'User ID']);
        let newObj = {
            phone: watcher[0],
            firstName: watcher[1],
            lastName: watcher[2],
            email: watcher[3],
            'User ID': watch[4]
        }

        const info = JSON.stringify(newObj)
        setCookie('hasSubmitForm', info)
    }
    const { isOpen, onOpen, onClose: onScheduleClose } = useDisclosure()


    const onError = msg => {
        setError({
            ...error,
            isError: true,
            errorMessage: msg,
        });
    };
    const { isError } = error;
    useEffect(() => {
        if (!id) return
        if (monthlyData.isTopLevelFetching) {
            // Need to update the logic
            (async () => {
                if (monthlyData.isLoaded) {
                    const data = JSON.parse(localStorage.getItem('result'));
                    if (monthlyData.data.message.error_reason) {
                        onError(monthlyData.data.message.error_reason);
                        setLoading(false);

                        onOpen()
                        return;
                    }
                    data.anualAndMonthlyData = monthlyData.data.message;

                    const docRef = doc(db, 'reports', id);
                    updateDoc(docRef, {
                        anualAndMonthlyData: JSON.stringify(monthlyData.data),
                    });

                    if (Object.keys(data.nightlyData).length > 0) {
                        data.formattedNightlyData = formateNightlyData(data.nightlyData);
                    }
                    setResults(data);
                    setLoading(false);
                }
            })();
            return;
        }

        (async () => {
            setLoading(true);

            const data = await getReportDetails(id);
            const { bedrooms, bathrooms, guests, coordinates } = data;
            if (!Object.keys(data.anualAndMonthlyData).length) {
                let anualBreakdown = {}
                if (!data.isError) {
                    anualBreakdown = await anualReportAndMonthlyBreakdown(
                        bedrooms,
                        bathrooms,
                        guests,
                        coordinates,
                    );


                }

                if (!('isError' in data)) {
                    syncAirtable(currentUser, { ...anualBreakdown, searchUrl: window.location.origin + `/result/${id}` }, data.location)

                };

                if (data.isError || anualBreakdown.message.error_reason) {
                    onError(anualBreakdown?.message?.error_reason || 'This property Have information is not suffeciant for getting proper estimation');
                    setLoading(false);
                    onOpen()
                    const ref = doc(db, 'reports', id);

                    if (!data.isError) {
                        updateDoc(ref, {
                            isError: true
                        })

                    }

                    return;
                }
                data.anualAndMonthlyData = anualBreakdown.message;

                delete anualBreakdown.message.example_listings;
                delete anualBreakdown.message.listings;
                const docRef = doc(db, 'reports', data.id);
                updateDoc(docRef, {
                    anualAndMonthlyData: JSON.stringify(anualBreakdown),
                });
            } else {
                data.anualAndMonthlyData = JSON.parse(data.anualAndMonthlyData).message;
                setError({
                    isError: false,
                    errorMessage: '',
                })
            }
            if (Object.keys(data.nightlyData).length > 0) {
                data.formattedNightlyData = formateNightlyData(data.nightlyData);
            }
            setResults(data);
            setLoading(false);



        })();
    }, [monthlyData, id]);

    const updateNightly = data => {
        setResults({
            ...results,
            nightlyData: data,
        });
    };

    const updateFormattedNightlyData = data => {
        setResults({
            ...results,
            formattedNightlyData: data,
        });
    };

    const updateNightlyState = (nightlyData, formattedNightlyData) => {
        setResults({
            ...results,
            nightlyData,
            formattedNightlyData,
        });
    };

    // removing last active result

    useEffect(() => {
        onClose()

        const id = localStorage.getItem('lastId');

        if (id) {
            localStorage.removeItem('lastId');
        }
    }, []);

    useEffect(() => {
        if (progress < 90) {
            const value = Math.floor(1 + Math.random() * 30);
            setTimeout(() => {

                if (loading) {
                    setProgress(value + progress);
                }

            }, 800);
        }
    }, [progress]);


    let TEXT_COLOR = '#242E43'
    const txtStyles = {
        lineHeight: '1.1',
        letterSpacing: '-2px',
    };
    const handleChange = (e) => {
        const { value, name } = e.target;

        setCookiesFormData({
            ...cookiesFormData,
            [name]: value,
        });
    }

    const handleClickCookie = async (data) => {

        if (('' + data.phone).replace(/\D/g, '').length !== 10) {
            setIsPhoneNumberValid(false);
            return;
        }
        let watcher = watch(['phone', 'firstName', 'lastName', 'email', 'User ID']);



        setIsCookiesLoading(true)

        const db = getFirestore();

        // @ts-ignore
        const ref = doc(db, 'reports', id);

        await updateDoc(ref, {
            referredby: arrayUnion({
                phone: watcher[0],
                firstName: watcher[1],
                lastName: watcher[2],
                email: watcher[3],
                'User ID': watcher[4]
            })
        });
        getSynced({
            phone: watcher[0],
            firstName: watcher[1],
            lastName: watcher[2],
            email: watcher[3],
            'User ID': watcher[4]

        })
        handleSetCookie();

        setIsCookiesLoading(false)
    }


    const getSynced = (cookiesFormData, existingCookieUser = false) => {
        const functions = getFunctions()
        const syncViewedBy = httpsCallable(functions, 'syncViewedBy');
        syncViewedBy({
            user: cookiesFormData ? cookiesFormData : currentUser,
            property: {
                id: results.id
            },
            isGate: cookiesFormData ? true : false,
            existingCookieUser: existingCookieUser,
            "User ID": cookiesFormData && cookiesFormData['User ID']
        })
    }
    useEffect(() => {
        if (cookies.hasSubmitForm) {
            setCookiesFormData(cookies.hasSubmitForm);
            getSynced(cookies.hasSubmitForm, true);
            return

        }

        if (Object.keys(results) === 0 || !currentUser) return;

        getSynced()

    }, [results, currentUser, cookies]);
    const getFormErrorMessage = (name) => {
        return errors[name] && <Text color={'#ff6565'} fontFamily={'GTMedium'} my={2} >{errors[name].message}</Text>
    };
    let formatPhoneNumber = (str) => {
        //Filter only numbers from the input
        let cleaned = ('' + str).replace(/\D/g, '');

        //Check if the input is of correct length
        let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3]
        };

        return null
    };



    return (

        <ResultContext.Provider
            value={{
                ...results,
                updateNightly,
                updateFormattedNightlyData,
                expense,
                setExpense,
                updateNightlyState,
                isNightlyGenarating,
                setIsNightlyGenarating,
            }}
        >
            <Box>
                <Head>
                    <title> Revenuebnb - {data.location}</title>
                    <meta name="description" content="Add a shopping cart to your site in minutes. Works with any site builder, CMS, and framework. 20 000+ merchants trust our e-commerce solution for their website. Join them!" />
                    <meta property="og:title" content={`Revenuebnb - ${data.location}`} />
                    <meta property="og:description" content={`Revenuebnb Vacation Rental revenue prediction for ${data.location}`} />
                    <meta property="og:url" content="https://snipcart.com/" />
                    <meta property="og:type" content="website" />
                </Head>
            </Box>


            {loading ? (
                <Flex
                    height={'100vh'}
                    align={'center'}
                    flexDir={'column'}
                    justifyContent={'center'}
                >
                    <Lottie
                        style={{ height: '200px', width: '200px', marginInline: 'auto' }}
                        animationData={graph}
                        loop={true}
                    />
                    <Text mt={'-26px'} fontSize={'24px'} fontWeight={'bold'}>
                        Results are loading
                    </Text>
                    <Progress
                        sx={{
                            borderRadius: '5px',
                            bg: '#E5E5E5',
                            '& > div': {
                                bg: '#00EAA0',
                            },
                        }}
                        mt={'10px'}
                        w={'55%'}
                        value={progress}
                        height={'17px'}
                    />
                </Flex>
            ) : (Object.keys(currentUser || {}).length === 0) && !cookies.hasSubmitForm ? (

                <Flex justifyContent={'center'} flexDir={'column'} height={'100%'} w={'100%'}>
                    <Flex alignItems={'center'} justifyContent={'center'} height={'100%'} >
                        <Flex width={'60%'} justify={'center'} direction='column'>

                            <Text sx={{ ...txtStyles, fontFamily: 'GTMedium ', color: TEXT_COLOR, mt: !isLargerThan768 && '40px' }} textAlign={'center'} fontSize={['35px', '46px']}>                View Annual Revenue Estimate

                            </Text>
                            <Box >
                                <Text
                                    mt={'20px'}
                                    textAlign={'center'}
                                    fontSize={'24px'}
                                    letterSpacing={'.7px'}
                                    lineHeight='1.1'
                                    fontFamily={'GTMedium'}
                                >
                                    {results.location}
                                </Text>
                                <Text mb={5} textAlign={'center'} fontFamily={'GTMedium'}>
                                    {results.bedrooms} bedrooms · {results.bathrooms} baths
                                </Text>
                            </Box>

                            <form onSubmit={handleSubmit(handleClickCookie)} >
                                <Flex
                                    direction={isLargerThan768 ? 'row' : 'column'}
                                    gap={!isLargerThan768 ? '0rem' : '.6rem'}
                                >
                                    <Box flex={1}>
                                        <Controller name="firstName" control={control}
                                            rules={{ required: 'First name is required.', }}
                                            render={({ field, fieldState }) => (
                                                <CustomInput
                                                    handleChange={handleChange}
                                                    icon={<BiUserCircle color='rgb(247, 34, 219)' />}
                                                    // @ts-ignore

                                                    placeholder='First Name'
                                                    name='firstName'
                                                    id={field.name} {...field}
                                                />
                                            )} />
                                        {getFormErrorMessage('firstName')}

                                    </Box>


                                    <Box flex={1} sx={{
                                        mt: !isLargerThan768 ? '20px' : '0px',
                                        w: '100%'
                                    }}>

                                        <Controller name="lastName" control={control}
                                            rules={{ required: 'Last name is required.', }}
                                            render={({ field, fieldState }) => (
                                                <CustomInput
                                                    handleChange={handleChange}

                                                    icon={<BiUserCircle color='rgb(247, 34, 219)' />}
                                                    // @ts-ignore

                                                    placeholder='Last Name'
                                                    name='lastName'
                                                    id={field.name} {...field}
                                                />
                                            )} />
                                        {getFormErrorMessage('lastName')}


                                    </Box>
                                </Flex>
                                <Box my={3} mt={2}>
                                    <Controller name="email" control={control}
                                        rules={{ required: 'Email is required.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'Invalid email address. E.g. example@email.com' } }}
                                        render={({ field, fieldState }) => (
                                            <CustomInput


                                                handleChange={handleChange}

                                                icon={<BiUserCircle color='rgb(247, 34, 219)' />}
                                                // @ts-ignore

                                                placeholder='Email'
                                                name='email'
                                                id={field.name} {...field}
                                            />
                                        )} />
                                    {getFormErrorMessage('email')}

                                </Box>


                                <Flex sx={{
                                    fontFamily: 'GTMedium',
                                    borderRadius: '24px',
                                    border: '2px solid #E2E8F0',
                                    height: '3.125rem',
                                    color: 'rgb(80,80,81)',
                                    transition: 'all 250ms ease 0s',
                                    _placeholder: {
                                        color: 'rgb(80,80,81)',
                                    },
                                    _hover: { border: '2px solid rgb(163, 223, 230)' },
                                    _focus: {},
                                    _active: {},
                                }} alignItems={'center'}>

                                    <Box p={3}>
                                        <Flex>
                                            <Image borderRadius={'100%'} w={'25px'} height={'25px'} src='https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png?20151118161041' />
                                            <Text ml={2}>+1</Text>
                                        </Flex>
                                    </Box>
                                    <Input onChange={(e) => {


                                        setValue('phone', e.target.value)
                                        setIsPhoneNumberValid(true)
                                    }} type={'text'} name="phone" value={formatPhoneNumber(watchr[0])} outline={'none'} border={'none'} _focus={{
                                        border: 'none',
                                        outline: 'none'
                                    }}

                                    />


                                </Flex>

                                {
                                    !isPhoneNumberValid ? (

                                        <Text color={'#ff6565'} fontFamily={'GTMedium'} my={2} >Please input a valid number</Text>
                                    ) : ''
                                }


                                <Button w={'100%'} type='submit' fontFamily={'GTMedium'} isLoading={isCookiesLoading} mt={4} fontWeight={'400'} bg={'rgb(247, 34, 219)'} color={'white'}  >
                                    View result
                                </Button>
                            </form>


                        </Flex>
                    </Flex>
                </Flex>
            ) : !isError ? (
                <Box>
                    <LogoItem />


                    <Price
                        average={results.anualAndMonthlyData.average}
                        professional={results.anualAndMonthlyData.percentile75}
                    />
                    <Breakdown
                        monthlyData={
                            results.anualAndMonthlyData.monthly_average_granuar_data
                        }
                    />
                    <Box marginTop={'40px'} paddingBottom={'20px'} fontSize={'15px'} color={'#6B6B6B'} fontWeight={500} fontFamily={'GT Eesti Text Light'}>
                        <Text textAlign={'center'} lineHeight={1.2}>Copywrite &copy;{new Date().getFullYear()}</Text>
                        <Flex align={'center'} justifyContent={'center'}>
                            <Text>Terms of use</Text>
                            &nbsp;
                            &
                            &nbsp;

                            <Text>Privacy Policy</Text>
                        </Flex>
                    </Box>


                </Box>
            ) : (
                <Schedule isOpen={isOpen} onOpen={onOpen} onClose={onScheduleClose} />
            )}
        </ResultContext.Provider>
    );
};

export async function getServerSideProps(context: any) {
    const data: any = await getReportDetails(context.query.id);

    return {
        props: { data }, // will be passed to the page component as props
    }
}

export default Result;
