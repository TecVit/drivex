import { notifyError } from "../toastifyServer";
import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import { firestore, auth } from "./login";

// Dados
const uidCookie = getCookie('uid') || '';
const nickCookie = getCookie('nick') || '';
const emailCookie = getCookie('email') || '';

// Funções

// Complexidade O(1)
const getStores = async () => {
    let list = [];
    try {
        const storesDoc = await firestore.collection('api')
            .doc('stores').get();

        if (storesDoc.exists) {
            const { stores } = storesDoc.data();
            list = stores;
            console.log(stores);
        }

        return list;
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Complexidade O(1)
const getStore = async (code) => {
    try {
        const storeDoc = await firestore.collection('store')
            .doc(code).get();

        if (storeDoc.exists) {
            const data = storeDoc.data();
            return data;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

// Complexidade O(N + 3)
const updateStoresAPI = async () => {
    let list = [];
    try {
        const storesRef = await firestore.collection('store')
            .where('isUpdated', '==', false)
            .get();

        if (!storesRef.empty) {
            await Promise.all(storesRef.docs.map(async (doc) => {
                const data = doc.data();
                list.push({ ...data, code: doc.id });
                
                await doc.ref.update({ isUpdated: true });
            }));
        }

        const apiDoc = await firestore.collection('api').doc('stores').get();

        let existingStores = [];
        if (apiDoc.exists) {
            existingStores = apiDoc.data().stores || [];
        }

        const combinedList = [...existingStores, ...list];

        const uniqueStores = Array.from(new Set(combinedList.map(store => store.code)))
            .map(code => combinedList.find(store => store.code === code));

        await firestore.collection('api')
            .doc('stores')
            .set({ stores: uniqueStores }, { merge: true });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export { getStores, getStore, updateStoresAPI };