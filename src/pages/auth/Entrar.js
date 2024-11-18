import React from 'react';
import './Entrar.css';
import { useLocation } from 'react-router-dom';
import { NotificationContainer } from '../../toastifyServer';
import Navbar from '../components/Navbar';

// Icons
import { IonIcon } from '@ionic/react';
import { person, storefront } from 'ionicons/icons';
import Footer from '../components/Footer';

export default function Entrar() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <main className='container-entrar'>
            <Navbar />
            <section className='content-entrar'>
                <h1>Escolha a maneira de realizar o Login</h1>
                <div className='profiles'>
                    <div className='profile client'>
                        <div className='circle'>
                            <IonIcon icon={person} className='icon' />
                        </div>
                        <h1>Cliente</h1>
                        <p>Quero comprar os melhores e mais baratos produtos de uma empresa</p>
                        <button onClick={() => window.location.href = "/entrar/cliente"}>Acessar área do cliente</button>
                    </div>
                    <div className='profile store'>
                        <div className='circle'>
                            <IonIcon icon={storefront} className='icon' />
                        </div>
                        <h1>Empresa</h1>
                        <p>Quero vender meus produtos e divulgar minha empresa</p>
                        <button onClick={() => window.location.href = "/entrar/empresa"}>Acessar área da empresa</button>
                    </div>
                </div>
                <a>Não tem uma conta? <strong onClick={() => window.location.href = "/cadastrar"}>Cadastrar</strong></a>
            </section>
            <Footer />
        </main>
    )
}