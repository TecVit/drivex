import React, { useState } from 'react';
import './css/Navbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationContainer } from '../../toastifyServer';
import { getCookie, setCookie } from '../../firebase/cookies';
import Logo from '../../image/logo.png';

// Icons
import { IonIcon } from '@ionic/react';
import { search } from 'ionicons/icons';

export default function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname.replace(/\/$/, "");

    // Dados
    const nomeCookie = getCookie('nome');
    const emailCookie = getCookie('email');
    const uidCookie = getCookie('uid');
    const fotoCookie = getCookie('foto');

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
                        <button onClick={() => navigate('/entrar')} className='btn-one'>Entrar</button>
                        <button onClick={() => navigate('/cadastrar')} className='btn-two'>Cadastrar</button>
                    </div>
                </div>
            </section>
        </header>
    )
}