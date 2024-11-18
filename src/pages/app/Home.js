import React, { useState } from 'react';
import './css/Home.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { NotificationContainer, notifyError, notifyInfo, notifySuccess } from '../../toastifyServer';
import Footer from '../components/Footer';

export default function Home() {

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    // Modais
    const [carregando, setCarregando] = useState(false);

    return (
        <main className='container-home'>
            <NotificationContainer />
            <Navbar />
            <section className='content-home'>
                
            </section>
            <Footer />
        </main>
    )
}