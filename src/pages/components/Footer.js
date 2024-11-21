import React, { useState } from 'react';
import './css/Footer.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { NotificationContainer } from '../../toastifyServer';
import { getCookie, setCookie } from '../../firebase/cookies';
import Logo from '../../image/logo.png';

// Icons
import { IonIcon } from '@ionic/react';
import { search } from 'ionicons/icons';

export default function Footer() {

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

    return (
        <footer className='container-footer'>
            <section className='content-footer'>
                <div className='links'>
                    <div className='text'>
                        <img src={Logo} />
                        <h1>Impulsione sua loja com um sistema inovador de anúncios de vendas online!</h1>
                        <p>DriveX, 2024.</p>
                    </div>
                    <li>
                        <a href="/carros">Todos os carros</a>
                        <a href="/concessionarias">Concessionárias</a>
                        <a href="/ofertas">Melhores ofertas</a>
                        <a href="/melhores-precos">Melhores preços</a>
                    </li>
                    <li>
                        <a href="/entrar">Entrar</a>
                        <a href="/cadastrar">Cadastrar</a>
                        <a href="/sobre-nos">Sobre nós</a>
                        <a href="/favoritos">Favoritos</a>
                    </li>
                    <li>
                        <a href='/termos-de-uso'>Termos de Uso</a>
                        <a href='politica-de-cookies'>Politica de Cookies</a>
                        <a href='politica-de-privacidade'>Politica de Privacidade</a>
                    </li>
                </div>
                <div className='credits'>
                    <div className='content'>
                        <p>&copy; 2024 DriveX LTDA. Todos Direitos Reservados.</p>
                    </div>
                </div>
            </section>
        </footer>
    )
}