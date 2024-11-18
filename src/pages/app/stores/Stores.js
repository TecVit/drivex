import React, { useEffect, useState } from 'react';
import './css/Stores.css';
import { useLocation, useParams } from 'react-router-dom';
import { NotificationContainer } from '../../../toastifyServer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Icons
import { IonIcon } from '@ionic/react';
import { 
  shirt, footsteps, fastFood, home, phonePortrait, gameController, bed, library, colorPalette, football, car, construct, 
  paw, search, apps, swapVertical, arrowForward, arrowBack,
  star
} from 'ionicons/icons';


export default function Stores() {
    const location = useLocation();
    const path = location.pathname;

    const params = useParams();
    const id = params.id;

    const storeData = { 
        code: 'burger-king', 
        stars: 4.5, 
        nome: 'Burger King', 
        foto: 'https://burgerking.com.br/images/bklogos/BK-novo-logo.svg',
        banner: 'https://raichu-uploads.s3.amazonaws.com/companypageconfiguration_1dfc7e42-777c-49c3-9959-7d9e411cb73a.jpg',
    };
  
    
    return (
        <main className='container-products'>
            <Navbar />
            <section className='content-products'>
                {storeData.banner && (
                    <div style={{ backgroundImage: `url(${storeData.banner})` }} className='banner'></div>
                )}
                <div className='content'>
                    
                </div>
            </section>
            <Footer />
        </main>
    );
}