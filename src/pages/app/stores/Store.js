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

import {
    GoogleMap,
    LoadScript,
    Marker,
    DirectionsRenderer,
} from "@react-google-maps/api";

// Icons
import { IonIcon } from '@ionic/react';
import { 
  shirt, footsteps, fastFood, home, phonePortrait, gameController, bed, library, colorPalette, football, car, construct, 
  paw, search, apps, swapVertical, arrowForward, arrowBack,
  star,
  personCircle,
  locationOutline,
  heart
} from 'ionicons/icons';

export default function Stores() {

    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    const params = useParams();
    const id = params.id;
    
    // Modais
    const [carregando, setCarregando] = useState(false);

    // Data
    const [storeData, setStoreData] = useState({});

    const storeDataFake = { 
        code: 'limar-automoveis', 
        stars: 4.23,
        nome: 'Limar Automóveis', 
        cidade: 'Araraquara - SP',
        bairro: 'Vila Sedenho',
        numero: '155',
        rua: 'Av. Pedro Galeazi',
        cep: '14806015',
        telefone: '(16) 99726-7084',
        cnpj: '08.337.462/0001-00',
        foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfaW9e8C6_eh5MtgDxYHLypzaq84EOfJanfw&s',
        carros: [
            {
                uid: uuidv4(),
                code: 'fiat-mobi-1.0-evo-flex-like-manual',
                nome: 'Fiat Mobi',
                modelo: '1.0 Evo Flex Like Manual',
                foto: 'https://image.webmotors.com.br/_fotos/anunciousados/gigante/2024/202410/20241010/fiat-mobi-1.0-evo-flex-like.-manual-wmimagem05061238423.jpg?s=fill&w=552&h=400&q=85',
                preco: 85000,
                descricao: 'Se você está buscando um novo carro, não se arrisque e compre na Localiza Seminovos: carros com 360 itens verificados, garantia e procedência. Aqui você encontra a maior variedade de modelos do mercado, condições únicas de financiamento, entrada facilitada em até 10 vezes sem juros, carros revisados e com garantia de quilometragem real. Viabilizamos a troca do seu carro usado e entregamos seu novo carro na segurança de sua casa! Agende já seu atendimento.',
                ano: 2020,
                quilometragem: '35.000 km',
                cidade: 'Ribeirão Preto, SP'
            },
            {
                uid: uuidv4(),
                code: 'honda-civic-2.0-16v-flexone-sport-cvt',
                nome: 'Honda Civic',
                modelo: '2.0 16V FlexOne Sport CVT',
                foto: 'https://image.webmotors.com.br/_fotos/anuncionovos/gigante/2024/202408/20240823/honda-civic-2.0-di-e:hev-advanced-ecvt-wmimagem11065108388.jpg?s=fill&w=552&h=400&q=85',
                preco: 125000,
                descricao: 'Honda Civic com design moderno, desempenho excepcional e conforto. Revisões em dia e garantia de procedência. Ótimas condições de financiamento e trocas.',
                ano: 2022,
                quilometragem: '15.000 km',
                cidade: 'Araraquara, SP'
            },
            {
                uid: uuidv4(),
                code: 'toyota-corolla-2.0-vvt-ie-flex-xei-direct-shift',
                nome: 'Toyota Corolla',
                modelo: '2.0 VVT-iE Flex XEi Direct Shift',
                foto: 'https://image.webmotors.com.br/_fotos/anunciousados/gigante/2024/202411/20241118/toyota-corolla-2-0-vvtie-flex-xei-direct-shift-wmimagem13051269711.webp?s=fill&w=249&h=186&q=70',
                preco: 135000,
                descricao: 'Toyota Corolla com tecnologia de ponta, segurança e economia. Uma escolha confiável para quem busca qualidade e durabilidade.',
                ano: 2021,
                quilometragem: '20.000 km',
                cidade: 'São Carlos, SP'
            }
        ]
    };

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


    // =====> Maps of Store <=====
    const [directions, setDirections] = useState(null);
    const [empresaLatLng, setEmpresaLatLng] = useState(null);
    const [cepCliente] = useState("14806-868"); 
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [routeLoaded, setRouteLoaded] = useState(false);
    const apiKey = 'AIzaSyCmiMWmmQjEhkVu7dKONgRpQ2CUsULomgk';

    const mapRef = useRef(null);

    // Função para calcular a rota
    const calcularRota = () => {
        if (!storeData || Object.keys(storeData).length <= 0) return;
        if (!cepCliente || !empresaLatLng) return;
        
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: cepCliente,
                destination: empresaLatLng,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setRouteLoaded(true);
                } else {
                    alert("Não foi possível calcular a rota. Verifique o CEP.");
                }
            }
        );
    };

    useEffect(() => {
        if (!storeData || Object.keys(storeData).length <= 0) return;
        if (!storeData?.cep) return;
        if (empresaLatLng) return;
        
        const fetchCoordinates = async () => {
            try {
                
                const enderecoCompleto = `${storeData.rua}, ${storeData?.numero}, ${storeData.bairro}, ${storeData.cidade}, ${storeData.cep}`;
                
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoCompleto)}&key=${apiKey}`
                );

                const data = await response.json();

                if (data.status === "OK" && data.results.length > 0) {
                    const { lat, lng } = data.results[0].geometry.location;
                    
                    setEmpresaLatLng({ lat, lng });
                } else {
                    console.error("Erro ao buscar coordenadas:", data.status);
                }
            } catch (error) {
                console.error("Erro ao buscar coordenadas:", error);
            }
        };

        fetchCoordinates();
    }, [storeData?.cep, apiKey]);

    const handleScriptLoad = () => {
        setGoogleLoaded(true);
    };

    useEffect(() => {
        if (!routeLoaded && empresaLatLng) {
            calcularRota();
        }
    }, [routeLoaded, empresaLatLng]);


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
                    {storeData?.cep && (
                        <section className='content-store'>
                            <div className='text'>
                                <h1>Local da concessionária</h1>
                            </div>
                            <div className='map'>
                                <LoadScript
                                    googleMapsApiKey={apiKey}
                                    onLoad={handleScriptLoad}
                                >
                                    <GoogleMap
                                        mapContainerStyle={{ height: "400px", width: "100%" }}
                                        center={empresaLatLng}
                                        zoom={15}
                                        ref={mapRef}
                                    >
                                        {empresaLatLng && <Marker position={empresaLatLng} /> }
                                        {directions && <DirectionsRenderer directions={directions} />}
                                    </GoogleMap>
                                </LoadScript>
                            </div>
                        </section>
                    )}
                    
                    <Footer />
                </main>
            )}
            
        </>
    );
}