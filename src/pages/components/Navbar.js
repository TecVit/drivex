import React, { useEffect, useState } from 'react';
import './css/Navbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationContainer, notifyInfo } from '../../toastifyServer';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';
import Logo from '../../image/logo.png';

// Icons
import { IonIcon } from '@ionic/react';
import { personCircle, search } from 'ionicons/icons';
import { auth, firestore } from '../../firebase/login';

export default function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.replace(/\/$/, "");

    // Dados
    const nomeCookie = getCookie('nome');
    const emailCookie = getCookie('email');
    const uidCookie = getCookie('uid');
    const fotoCookie = getCookie('foto');

    const [mdAccount, setMdAccount] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged( async function(user) {
            if (user) {
                if (user.email && emailCookie === user.email || user.uid && uidCookie === user.uid) {
                    setMdAccount(true);
                }
            }
        });

        return () => unsubscribe();
    }, [uidCookie, emailCookie]);

    // Modais
    const [carregando, setCarregando] = useState(false);

    const getClass = (nome) => path === `/painel/${nome.toLowerCase()}` ? 'selecionado' : '';

    return (
        <header className='container-navbar'>
            <section className='content-navbar'>
                <div className='navbar'>
                    <div onClick={() => navigate('/')} className='logo'>
                        <img src={Logo} />
                    </div>
                    <div className='search'>
                        <input placeholder='Qual carro você deseja buscar?' type="text" />
                        <IonIcon icon={search} className="icon" />
                    </div>
                    <div className='btns'>
                        {mdAccount ? (
                            <>
                                <div className='profile'>
                                    {path === '/perfil' ? (
                                        <>
                                            <button onClick={() => navigate('/')} className='btn-one'>Voltar</button>
                                            <button onClick={() => {
                                                clearCookies();
                                                notifyInfo('Saindo da conta, aguarde...');
                                                setTimeout(() => {
                                                    window.location.href = "/";
                                                }, 2000);
                                            }} className='btn-one'>Sair da conta</button>
                                        </>
                                    ) : (
                                        <button onClick={() => navigate('/perfil')} className='btn-one'>Ver perfil</button>
                                    )}
                                </div>
                            </>    
                        ) : (
                            <>
                                <button onClick={() => navigate('/entrar')} className='btn-one'>Entrar</button>
                                <button onClick={() => navigate('/cadastrar')} className='btn-two'>Cadastrar</button>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </header>
    )
}