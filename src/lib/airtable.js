import { getFunctions, httpsCallable } from "firebase/functions";


export const getAirtableSync = (user, property) => {
    const functions = getFunctions()
    const syncAirtable = httpsCallable(functions, 'syncAirtable');
    syncAirtable({
        user,
        property
    })
} 





export const syncAirtable = async (currentUser, data, location) => {
    const { firstName, lastName, email, id, phone } = currentUser;
    //  Update logic if error exist
    getAirtableSync({
        firstName,
        lastName,
        phoneNumber: phone,
        id,
        email,
    }, {

        address: location,
        professionalOccupancy: data.message.percentile75?.occupancy_rate || 0,
        professionalPerYear: data.message.percentile75?.revenue * 12 || 0,
        isError: String('error_reason' in data.message),
        searchUrl: data.searchUrl,
        id: data.id


    })

}