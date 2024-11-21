import { notifyError } from "../toastifyServer";
import { clearCookies, deleteCookie, getCookie, setCookie } from "./cookies";
import { firestore, auth } from "./login";

// Dados
const uidCookie = getCookie('uid') || '';
const nickCookie = getCookie('nick') || '';
const emailCookie = getCookie('email') || '';

// Funções
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

const updateStoresAPI = async () => {
    let list = [];
    try {
        const storesRef = await firestore.collection('store').get();

        if (!storesRef.empty) {
            await Promise.all( storesRef.docs.map(async (doc) => {
                const data = doc.data();
                list.push({ ...data, code: doc.id });
            }));
        }

        await firestore.collection('api')
        .doc('stores').set({ stores: list }, { merge: true });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export { getStores, getStore, updateStoresAPI };