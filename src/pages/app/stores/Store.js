import React, { useEffect, useRef, useState } from 'react';
import './css/Store.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotificationContainer } from '../../../toastifyServer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Firebase
import { getStore } from '../../../firebase/stores';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icons
import { IonIcon } from '@ionic/react';
import { 
  shirt, footsteps, fastFood, home, phonePortrait, gameController, bed, library, colorPalette, football, car, construct, 
  paw, search, apps, swapVertical, arrowForward, arrowBack,
  star,
  personCircle,
  locationOutline,
  heart,
  locationSharp,
  logoInstagram,
  logoFacebook,
  logoWhatsapp
} from 'ionicons/icons';
import { ImWhatsapp } from 'react-icons/im';

import CustomSelect from '../components/CostumSelect';

export default function Stores() {
    
    function formatPhoneNumber(phone) {
        return phone.replace(/\D/g, '');
    }

    // Opções do select
    const fruitOptions = [
        { value: "apple", label: "🍎 Apple" },
        { value: "orange", label: "🍊 Orange" },
        { value: "banana", label: "🍌 Banana" },
        { value: "grape", label: "🍇 Grape" },
        { value: "watermelon", label: "🍉 Watermelon" },
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    const params = useParams();
    const id = params.id;
    
    // Modais
    const [carregando, setCarregando] = useState(true);

    // Data
    const [storeData, setStoreData] = useState({});

    const [images, setImages] = useState([]);
    const nextStore = () => {
        if (carouselRef.current) {
          carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };
    const prevStore = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    // =====> Banner <=====
    const carouselRef = useRef(null);
    const scroll = (direction) => {
        if (carouselRef.current) {
          const scrollAmount = direction === 'left' ? -100 : 100;
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const [mdBanner, setMdBanner] = useState(true);

    // const apiKey = 'AIzaSyCmiMWmmQjEhkVu7dKONgRpQ2CUsULomgk';

    useEffect(() => {
        const getStoreData = async () => {
            setCarregando(true);
            try {
                const data = await getStore(id);
                if (data && Object.keys(data).length > 0) {
                    setStoreData(data);
                    if (data.carros && data.carros.length > 0) {
                        setImages(data.carros);
                        setMdBanner(true);
                    } else {
                        setMdBanner(false);
                    }
                    return true;
                }
                return false;
            } catch (error) {
                console.error(error);
                return false;
            } finally {
                setCarregando(false);
            }
        }
        getStoreData();
    }, []);

    const { latitude, longitude } = {
        latitude: -23.55052,
        longitude: -46.633308,
    };
    
    const customIcon = L.divIcon({
        className: 'icon-location',
        html: `<svg fill="#d33936" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>ionicons-v5-n</title><path d="M256,32C167.67,32,96,96.51,96,176c0,128,160,304,160,304S416,304,416,176C416,96.51,344.33,32,256,32Zm0,224a64,64,0,1,1,64-64A64.07,64.07,0,0,1,256,256Z"></path></g></svg>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    return (
        <>
            <Navbar />
            {storeData && Object.keys(storeData).length > 0 && !carregando && (
                <main className='container-store'>
                
                    {mdBanner && (
                        
                        <div className='banner'>
                            <div className='images' ref={carouselRef}>
                                {images.length ? (
                                    images.map((carro, i) => ( 
                                        <div className='image' key={i}>
                                            <img src={carro.foto} className='image' />
                                        </div>
                                    ))
                                ) : (
                                    <p>Nenhuma loja encontrada.</p>
                                )}
                            </div> 
                            {images.length > 2 && (
                                <>
                                    <IonIcon onClick={prevStore} icon={arrowBack} className='arrow left desktop-500' />
                                    <IonIcon onClick={nextStore} icon={arrowForward} className='arrow right desktop-500' />
                                </>
                            )}
                        </div>
                    )}
                    
                    <section className={`content-store ${mdBanner && 'banner-exists'}`}>
                        <div className='profile'>
                            <div className='person'>
                                {storeData.foto ? (
                                    <div className='logo' style={{ backgroundImage: `url(${storeData.foto})` }}></div>
                                ) : (
                                    <IonIcon className='logo icon' icon={personCircle} />
                                )}
                                <h1>{storeData.nome}</h1>
                            </div>
                        </div>
                        <div className='info'>
                            <div className='list'>
                                {[
                                    { label: 'Cidade', value: storeData.cidade },
                                    { label: 'Bairro', value: storeData.bairro },
                                    { label: 'Rua', value: storeData.rua },
                                    { label: 'Número', value: storeData.numero },
                                    { label: 'CEP', value: storeData.cep },
                                    { label: 'Telefone', value: storeData.telefone },
                                    { label: 'CNPJ', value: storeData.cnpj },
                                    { label: 'Carros Anunciados', value: storeData?.carros?.length }
                                ].map(
                                    (field, index) =>
                                        field.value && (
                                            <li key={index}>
                                                <label>{field.label}</label>
                                                <p>{field.value}</p>
                                            </li>
                                        )
                                )}
                            </div>
                        </div>
                        {storeData?.whatsapp || storeData?.instagram || storeData?.facebook ? (
                            <div className="network-social">
                                <div className="btns">
                                    {storeData?.whatsapp && (
                                        <button onClick={() => window.open(`https://wa.me/55${formatPhoneNumber(storeData?.whatsapp)}`)} className="whatsapp">
                                            <IonIcon icon={logoWhatsapp} className="icon" />
                                            Whatsapp
                                        </button>
                                    )}
                                    {storeData?.instagram && (
                                        <button onClick={() => window.open(storeData?.instagram)} className="instagram">
                                            <IonIcon icon={logoInstagram} className="icon" />
                                            Instagram
                                        </button>
                                    )}
                                    {storeData?.facebook && (
                                        <button onClick={() => window.open(storeData?.facebook)} className="facebook">
                                            <IonIcon icon={logoFacebook} className="icon" />
                                            Facebook
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <></>
                        )}
                    </section>

                    {storeData?.carros?.length > 0 && (
                        <section className="content-store">
                            <div className='text'>
                                <h1>Todos os Carros</h1>
                            </div>
                            <div className='cars'>
                                {storeData.carros.length > 0 ? (
                                    storeData.carros.map((carro, i) => (
                                        <div className='car' key={i}>
                                            <img src={carro.foto} className='image' />
                                            <h1>{carro.nome}</h1>
                                            <p>{carro.modelo}</p>
                                            <h2> R$ <strong>{parseFloat(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></h2>
                                            <div className='between'>
                                                <a>{carro.ano}</a>
                                                <a>{carro.quilometragem}</a>
                                            </div>
                                            <button onClick={() => navigate(`/carros/${carro.code}-${carro.uid}`)}>Ver mais informação</button>
                                            <div className='location'>
                                                <p>
                                                    <IonIcon icon={locationOutline} className='icon' />
                                                    {carro.cidade}
                                                    <IonIcon icon={heart} className='like' />
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nenhum carro encontrado.</p>
                                )}
                            </div>
                        </section>
                    )}
                            
                    {/* Mapa */}
                    {storeData?.cep  && (
                        <section className='content-store'>
                            <div className='text'>
                                <h1>Local da concessionária</h1>
                            </div>
                            <div className='map'>
                                <iframe src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCB9S0dGxQ3Wq5aHs_j0w-7DhyaGf4VoQ4&q=${storeData?.estado}, ${storeData?.cep}, ${storeData?.cidade}, ${storeData?.bairro}, ${storeData?.rua}, ${storeData?.numero}`}></iframe>
                                {/*
                                    <MapContainer
                                        center={[latitude, longitude]}
                                        zoom={13}
                                        style={{ height: "400px", width: "100%" }}
                                        >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            // Satelite => url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                        />
                                        <Marker icon={customIcon} position={storeData?.location}>
                                            <Popup>
                                                Localização: {latitude}, {longitude} <br />
                                                CEP: {storeData?.cep}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                 */}
                            </div>
                        </section>
                    )}

                    {/* Feedbacks */}
                    
                    <Footer />
                </main>
            )}

            {carregando && (
                <main className='container-store'>
                    
                    <section className={`content-store`}>
                        <div className='profile'>
                            <div className='person'>
                                <div className='icon'>
                                    <div className='icon-loading'></div>
                                </div>
                                <h1 className='loading'></h1>
                        </div>    
                        </div>
                        <div className='info'>
                            <div className='list'>
                                {[
                                    { label: 'Cidade', value: '' },
                                    { label: 'Bairro', value: '' },
                                    { label: 'Rua', value: '' },
                                    { label: 'Número', value: '' },
                                    { label: 'CEP', value: '' },
                                    { label: 'Telefone', value: '' },
                                    { label: 'CNPJ', value: '' },
                                    { label: 'Carros Anunciados', value: '' }
                                ].map ((field, index) =>
                                    <li key={index}>
                                        <label className='loading'></label>
                                        <p className='loading'></p>
                                    </li>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="content-store">
                        <div className='text'>
                            <h1>Todos os Carros</h1>
                        </div>
                        <div className='cars'>
                            {[0, 1, 2, 3].map((carro, i) => (
                                <div className='car' key={i}>
                                    <div className='image loading'></div>
                                    <h1 className='loading'></h1>
                                    <p className='loading'></p>
                                    <h2> R$ <div className='loading'></div></h2>
                                    <div className='between'>
                                        <a>{carro.ano}</a>
                                        <a>{carro.quilometragem}</a>
                                    </div>
                                    <button className='loading'></button>
                                    <div className='location'>
                                        <p>
                                            <IonIcon icon={locationOutline} className='icon' />
                                            <div className='loading'></div>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* Mapa */}
                    <section className='content-store'>
                        <div className='text'>
                            <h1>Local da concessionária</h1>
                        </div>
                        <div className='map loading'></div>
                    </section>
                    
                    <Footer />
                </main>
            )}
            
        </>
    );
}