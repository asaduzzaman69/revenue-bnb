import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { anualReportAndMonthlyBreakdown } from "./rapidApi";


export const setBaseResultDoc = async (propertyData) => {
    const ref = doc(collection(db, 'reports'));


    await setDoc(ref, {
        id: ref.id,
        anualAndMonthlyData: {},
        nightlyData: [],
        ...propertyData
    })

    return ref.id



}

export const createReports = async (propertyData) => {
    const { bedrooms, bathrooms, guests, coordinates } = propertyData
    const ref = doc(collection(db, 'reports'));

    // fetch monthly breakdown
    const anualAndMonthlyData = await anualReportAndMonthlyBreakdown(bedrooms, Math.floor(bathrooms), guests, coordinates)
    await setDoc(ref, {
        id: ref.id,
        anualAndMonthlyData: JSON.stringify(anualAndMonthlyData),
        nightlyData: [],
        bedrooms, bathrooms, coordinates
    })

    return {
        id: ref.id,
        anualAndMonthlyData,
        nightlyData: [],
        bedrooms, bathrooms, coordinates
    }

}


export const getReportDetails = async (id) => {


    const ref = doc(db, 'reports', id);
    const snapshot = await getDoc(ref);


    return snapshot.data()
}

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const formateNightlyData = (nightlyArray) => {

    let nightlyObject = {}

    nightlyArray.forEach((el) => {
        const month = el.date.split('-')[1];

        nightlyObject[months[month - 1]] = nightlyObject[months[month - 1]] || []
        nightlyObject[months[month - 1]].push(el)


    })

    return nightlyObject

}

export const updateInvestmentData = async (expense, id, investmentData) => {
    const ref = doc(db, 'reports', id);
    const { capRate, investmentScore } = investmentData;
    await updateDoc(ref, {
        purchasedPrice: expense.purchasedPrice,
        capRate,
        investmentScore,
        totalExpense: expense.expense
    })

}