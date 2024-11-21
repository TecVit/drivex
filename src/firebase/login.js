import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import { firebaseConfig } from './firebaseConfig';
import { clearCookies, getCookie, setCookie } from './cookies';
import { notifyInfo } from '../toastifyServer';

const uidCookie = getCookie('uid') || null;
const nomeCookie = getCookie('nome') || null;
const emailCookie = getCookie('email') || null;

// Inicializando o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();
const auth = firebase.auth();

const formatarNomeDeUsuario = (valor) => {
    valor = valor.replace(/\s+/g, '');
    valor = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    valor = valor.replace(/[^a-zA-Z0-9]/g, '');
    return valor;
};

const verifyAccountExists = async (uid) => {
    try {
        const userDocRef = firestore.collection('users').doc(uid);
        const storeDocRef = firestore.collection('stores').doc(uid);

        const userDocSnapshot = await userDocRef.get();
        const storeDocSnapshot = await storeDocRef.get();

        if (userDocSnapshot.exists || storeDocSnapshot.exists) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar conta:', error);
        return false;
    }
};

export const entrarComRedeSocial = async (provedor, type) => {
    await clearCookies();
    return auth.signInWithPopup(provedor)
        .then((result) => {
            const user = result.user;
            let usuarioRef;
            if (type === 'user') {
                usuarioRef = firestore.collection('users').doc(user.uid);
            } else if (type === 'store') {
                usuarioRef = firestore.collection('stores').doc(user.uid);
            } else {
                throw new Error("Tipo inválido! Use 'user' ou 'store'.");
            }
            return usuarioRef.get()
            .then( async (doc) => {
                if (doc.exists) {
                    const dados = doc.data();
                    const camposCookies = ['nome', 'email', 'foto'];
                    
                    camposCookies.forEach((campo) => {
                        if (dados[campo]) {
                            setCookie(campo, dados[campo]);
                        }
                    });
                    
                    setCookie('uid', user.uid);

                    if (!dados.informacoesCompleta) {
                        return 'cadastro-incompleto';
                    }

                    return 'sucesso';
                } else {
                    return 'usuario-nao-existe';
                }
            })
            .catch((error) => {
                console.log(error);
                return 'conta-nao-existe';
            });
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                return 'popup-fechou';
            }
            console.log(error);
            return 'erro';
        });
};

export const cadastrarComRedeSocial = async (provedor, type) => {
    await clearCookies();
    return auth.signInWithPopup(provedor)
        .then(async (result) => {
            const user = result.user;
            if (!user) {
                return 'erro';
            }
    
            const uid = user.uid;
            const isAccountRegistered = await verifyAccountExists(uid);
            if (isAccountRegistered) {
                return 'email-em-uso';
            }

            let usuarioRef;
            if (type === 'user') {
                usuarioRef = firestore.collection('users').doc(user.uid);
            } else if (type === 'store') {
                usuarioRef = firestore.collection('stores').doc(user.uid);
            } else {
                throw new Error("Tipo inválido! Use 'user' ou 'store'.");
            }
            return usuarioRef.get()
                .then(async (doc) => {
                    if (doc.exists) {
                        return 'usuario-existe';
                    } else {

                        console.log(user);
                        
                        await usuarioRef.set({
                            nome: user.displayName,
                            email: user.email,
                            foto: user.photoURL,
                            informacoesCompleta: false,
                        });

                        setCookie('nome', user.displayName);
                        setCookie('email', user.email);
                        setCookie('foto', user.photoURL);
                        setCookie('uid', user.uid);
                        
                        return 'sucesso';
                    }
                })
                .catch((error) => {
                    console.log(error, error.code);
                    return 'erro';
                });
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                return 'popup-fechou';
            }
            console.log(error, error.code);
            return 'erro';
        });
};

export const cadastrarComEmail = async (email, senha, type) => {
    await clearCookies();
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;

        if (!user) {
            return 'erro';
        }

        const uid = user.uid;
        const isAccountRegistered = await verifyAccountExists(uid);
        if (isAccountRegistered) {
            return 'email-em-uso';
        }

        let userDocRef;
        if (type === 'user') {
            userDocRef = firestore.collection('users').doc(user.uid);
        } else if (type === 'store') {
            userDocRef = firestore.collection('stores').doc(user.uid);
        } else {
            throw new Error("Tipo inválido! Use 'user' ou 'store'.");
        }

        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            const dados = userDoc.data();

            if (!dados.informacoesCompleta) {
                return 'cadastro-incompleto';
            }

            return 'usuario-existe';
        } else {

            await userDocRef.set({
                email: email,
                informacoesCompleta: false,
            });

            setCookie('email', email);
            setCookie('uid', uid);

            return 'sucesso';
        }
    } catch (error) {
        console.log(error.code);
        
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        } else if (error.code === 'auth/invalid-credential') {
            return 'credenciais-invalidas';
        } else if (error.code === 'auth/email-already-in-use') {
            return 'email-em-uso';
        }
        console.error('Erro ao cadastrar:', error, error.code);
        return 'erro';
    }
};

export const entrarComEmail = async (email, senha, type) => {
    await clearCookies();
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        const user = userCredential.user;

        if (!user) {
            return 'credencial-invalida';
        }

        const uid = user.uid;
        
        let userDocRef;
        if (type === 'user') {
            userDocRef = firestore.collection('users').doc(user.uid);
        } else if (type === 'store') {
            userDocRef = firestore.collection('stores').doc(user.uid);
        } else {
            throw new Error("Tipo inválido! Use 'user' ou 'store'.");
        }

        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            const dados = userDoc.data();
            const camposCookies = ['nome', 'email', 'foto'];

            camposCookies.forEach((campo) => {
                if (dados[campo]) {
                    setCookie(campo, dados[campo]);
                }
            });

            setCookie('uid', uid);
            
            if (!dados.informacoesCompleta) {
                return 'cadastro-incompleto';
            }

            return 'sucesso';
        } else {
            return 'usuario-nao-existe'; 
        }
    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        } else if (error.code === 'auth/invalid-credential') {
            return 'credenciais-invalidas';
        }
        console.error('Erro ao entrar:', error);
        return 'erro';
    }
};

export const enviarLinkEmail = (email) => {
    return auth.sendPasswordResetEmail(email)
    .then(() => {
        console.log('E-mail de redefinição de senha enviado com sucesso');
        return 'sucesso';
    })
    .catch((error) => {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        }
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        return 'erro';
    });
};

export const redefinirSenha = (codigoOOB, novaSenha) => {
    return firebase.auth().confirmPasswordReset(codigoOOB, novaSenha)
      .then(() => {
        // Senha definida com sucesso
        console.log('Senha definida com sucesso');
        return 'sucesso';
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
            return 'email-invalido';
        }
        console.error('Erro ao definir a senha:', error);
        return 'erro';
      });
  };
  
  
export const entrarComGoogle = (type) => {
    const provedor = new firebase.auth.GoogleAuthProvider();
    return entrarComRedeSocial(provedor, type);
};

export const entrarComFacebook = () => {
    const provedor = new firebase.auth.FacebookAuthProvider();
    return entrarComRedeSocial(provedor);
};

export const cadastrarComGoogle = (type) => {
    const provedor = new firebase.auth.GoogleAuthProvider();
    return cadastrarComRedeSocial(provedor, type);
};

export const cadastrarComFacebook = () => {
    const provedor = new firebase.auth.FacebookAuthProvider();
    return cadastrarComRedeSocial(provedor);
};
  
export const sair = () => {
  return auth.signOut();
};

export { firebase, firestore, auth };