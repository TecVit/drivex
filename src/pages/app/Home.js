import React, { useEffect, useRef, useState } from 'react';
import './css/Home.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { NotificationContainer, notifyError, notifyInfo, notifySuccess } from '../../toastifyServer';
import Footer from '../components/Footer';
import { arrowBack, arrowForward, heart, heartOutline, locationOutline, personCircle, star } from 'ionicons/icons';
import { IonIcon } from '@ionic/react'; 
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import Banner from '../../image/banner.png';
import { getStores } from '../../firebase/stores';

export default function Home() {

    function gerarCode(nome) {
        return nome
          .normalize("NFD") // Normaliza a string para decompor os acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
          .replace(/[^a-zA-Z0-9\s]/g, '-') // Substitui caracteres especiais por '-'
          .replace(/\s+/g, '-') // Substitui espaços por '-'
          .toLowerCase(); // Transforma tudo em minúsculas
    }

    const results = require('../../results.json');

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    // Modais
    const [carregando, setCarregando] = useState(false);

    const carsList = [
        {
            uid: uuidv4(),
            code: 'fiat-mobi-1.0-evo-flex-like-manual',
            nome: 'Fiat Mobi',
            modelo: '1.0 Evo Flex Like Manual',
            foto: 'https://image.webmotors.com.br/_fotos/anunciousados/gigante/2024/202410/20241010/fiat-mobi-1.0-evo-flex-like.-manual-wmimagem05061238423.jpg?s=fill&w=249&h=186&q=70',
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
            foto: 'https://image.webmotors.com.br/_fotos/anuncionovos/gigante/2024/202408/20240823/honda-civic-2.0-di-e:hev-advanced-ecvt-wmimagem11065108388.jpg?s=fill&w=249&h=186&q=70',
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
    ];

    const [stores, setStores] = useState([]);
    const [cars, setCars] = useState(carsList);
  
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

    let banners = [
        Banner,
    ];

    const carouselRef = useRef(null);
    const scroll = (direction) => {
        if (carouselRef.current) {
          const scrollAmount = direction === 'left' ? -100 : 100;
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Location
    const [locationUser, setLocationUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationUser({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    setError("Erro ao obter localização: " + err.message);
                }
            );
        } else {
            setError("Geolocalização não suportada pelo navegador");
        }
    }, []);
    
    const fetchNearbyStores = async (latitude, longitude) => {
        const apiKeyMaps = 'AIzaSyC8oScECyz1YvLfpeLt3bhNKCOxstRrGgE';
        const radius = 5000;

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
                    params: {
                        location: `${latitude},${longitude}`,
                        radius: radius,
                        keyword: 'carro',
                        types: 'car_dealer',
                        key: apiKeyMaps
                    }
                });

            const data = response.data;

            if (data.results) {
                console.log(data.results);
                return data.results;
            } else {
                console.error('Erro ao buscar lojas', data.error_message);
                return [];
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            return [];
        }
    };
    
    useEffect(() => {
        if (locationUser && locationUser.latitude && locationUser.longitude) {
            fetchNearbyStores(locationUser.latitude, locationUser.longitude);
        }
    }, [ locationUser ]);
    
    // Array de objetos com o nome, latitude e longitude
    const [locais, setLocais] = useState(results.results);

    const getDistance = async (destination, origin) => {
        const apiKey = 'AIzaSyAF_RGT7Ox1FSzlCK5gC43mDC-O-DJfMFM';
        
        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: origin,
                    destinations: destination,
                    key: apiKey,
                }
            });

            const data = response.data;
            if (data.rows && data.rows[0].elements[0].status === 'OK') {
                const distance = data.rows[0].elements[0].distance.value;
                console.log(`A distância entre os dois endereços é: ${distance}`);
                return distance;
            } else {
                console.error('Erro ao calcular a distância:', data.error_message);
                return null;
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            return null;
        }
    };

    useEffect(() => {
        const getStoresList = async () => {
            setCarregando(true);
            try {
                const storesList = await getStores();
                if (storesList.length > 0) {
                    setStores(storesList);
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
        getStoresList();
    }, []);

    return (
        <main className='container-home'>
            <NotificationContainer />
            <Navbar />
            <div className='main'>
                <div className='images'>
                    <img src={Banner} alt="Banner" className="imagem" />
                </div>
            </div>

            <section className='content-home'>

                <div className='part'>
                    <div className='links'>
                        <h2>Concessionárias</h2>
                        <Link to='/concessionarias'>Ver todas</Link>
                    </div>
                    <div className='stores'>
                        {stores.length && !carregando ? (
                            stores.map((store, i) => (
                                    <div onClick={() => window.location.href = `/concessionaria/${gerarCode(store.nome)}`} className='store' key={i}>
                                        {store.foto ? (
                                            <div className='image' style={{ backgroundImage: `url(${store.foto})` }}></div>
                                        ) : (
                                            <IonIcon icon={personCircle} className='icon' />
                                        )}
                                        <h1>{store.nome}</h1>
                                        <div className="stars">
                                        <IonIcon icon={star} className='star' />
                                        <p><strong>{store.stars || 5}</strong> / 5</p>
                                        </div>
                                    </div>
                                ))
                        ) : !carregando && (
                            <p>Nenhuma concessionária encontrada.</p>
                        )}
                    </div>
                    {stores.length > 2 && (
                        <>
                            <IonIcon onClick={prevStore} icon={arrowBack} className='arrow left desktop-500' />
                            <IonIcon onClick={nextStore} icon={arrowForward} className='arrow right desktop-500' />
                        </>
                    )}
                </div>

                <div className='part'>
                    <div className='links'>
                        <h2>Carros</h2>
                        <Link to='/carros'>Ver todos</Link>
                    </div>
                    <div className='cars' ref={carouselRef}>
                        {cars.length ? (
                            cars.map((car, i) => ( 
                                <div className='car' key={i}>
                                    <img src={car.foto} className='image' />
                                    <h1>{car.nome}</h1>
                                    <p>{car.modelo}</p>
                                    <h2> R$ <strong>{parseFloat(car.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></h2>
                                    <div className='between'>
                                        <a>{car.ano}</a>
                                        <a>{car.quilometragem}</a>
                                    </div>
                                    <button onClick={() => navigate(`/carros/${car.code}-${car.uid}`)}>Ver mais informação</button>
                                    <div className='location'>
                                        <p>
                                            <IonIcon icon={locationOutline} className='icon' />
                                            {car.cidade}
                                            <IonIcon icon={heart} className='like' />
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nenhuma loja encontrada.</p>
                        )}
                    </div> 
                    {cars.length > 2 && (
                        <>
                            <IonIcon onClick={prevStore} icon={arrowBack} className='arrow left desktop-500' />
                            <IonIcon onClick={nextStore} icon={arrowForward} className='arrow right desktop-500' />
                        </>
                    )}
                </div>

            </section>
            <Footer />
        </main>
    )
}