import React from 'react';
import './Entrar.css';
import { useLocation } from 'react-router-dom';
import { NotificationContainer } from '../../toastifyServer';
import Navbar from '../components/Navbar';

// Icons
import { IonIcon } from '@ionic/react';
import { person, storefront } from 'ionicons/icons';
import Footer from '../components/Footer';

export default function Cadastrar() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <main className='container-entrar'>
            <Navbar />
            <section className='content-entrar'>
                <h1>Crie uma conta no Mercado Digital</h1>
                <p>Para começar, escolha o seu tipo de perfil:</p>
                <div className='profiles'>
                    <div className='profile client'>
                        <div className='circle'>
                            <IonIcon icon={person} className='icon' />
                        </div>
                        <h1>Cliente</h1>
                        <p>Faça seu cadastro, compre os melhores e mais baratos produtos de uma empresa</p>
                        <button onClick={() => window.location.href = "/cadastrar/cliente"}>Cadastro de cliente</button>
                    </div>
                    <div className='profile store'>
                        <div className='circle'>
                            <IonIcon icon={storefront} className='icon' />
                        </div>
                        <h1>Empresa</h1>
                        <p>Faça seu cadastro, venda seus produtos e divulge sua empresa</p>
                        <button onClick={() => window.location.href = "/cadastrar/empresa"}>Cadastro de empresa</button>
                    </div>
                </div>
                <a>Já possui uma conta? <strong onClick={() => window.location.href = "/entrar"}>Entrar</strong></a>
            </section>
            <Footer />
        </main>
    )
}