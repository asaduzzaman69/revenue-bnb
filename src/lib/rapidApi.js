import axios from "axios";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';



export const anualReportAndMonthlyBreakdown = async (bedrooms, bathrooms, guests, coordinates,) => {


    const options = {
        method: 'GET',
        url: 'https://airbnb-income-prediction.p.rapidapi.com/getIncomeHistory',
        params: {
            coordinate: `(${coordinates[1]}, ${coordinates[0]})`,
            countryCode: 'US',
            bedrooms: Math.floor(bedrooms),
            bathrooms: Math.floor(bathrooms),
            hasPool: false,
            radiusInMeter: 5000,
        },
        headers: {
            'X-RapidAPI-Host': 'airbnb-income-prediction.p.rapidapi.com',
            'X-RapidAPI-Key': '2296d55f65mshf88a20cd74a3c69p17aa1ejsnae76cc48da6b'
        }
    };

    const response = await axios.request(options);
    return response.data;

}

export const getNightlyData = async (bedrooms, coordinates, id) => {
    const options = {
        method: 'GET',
        url: 'https://airbnb-market-maker.p.rapidapi.com/getBookingChanges',
        params: { coordinate: `(${coordinates[1]}, ${coordinates[0]})`, countryCode: 'US', bedrooms: Math.floor(bedrooms) },
        headers: {
            'X-RapidAPI-Host': 'airbnb-market-maker.p.rapidapi.com',
            'X-RapidAPI-Key': '2296d55f65mshf88a20cd74a3c69p17aa1ejsnae76cc48da6b'
        }
    };
    try {
        const response = await axios.request(options);

        const ref = doc(db, 'reports', id);

        updateDoc(ref, {
            nightlyData: response.data.message
        }) 

        return response.data.message
    } catch (err) {
        console.log(err)
    }


}



export const getCachedOrLiveAnualData = async (id, additionalObject) => {
    const docSnap = await getDoc(db, 'results', id);

    if (docSnap.exists()) {
        return await docSnap.data()
    } else {
        const { bedrooms, bathrooms, guests, coordinates } = additionalObject
        const data = await anualReportAndMonthlyBreakdown(bedrooms, bathrooms, guests, coordinates);
        return data
    }

}

