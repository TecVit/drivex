import React, { useEffect, useState } from 'react';
import './css/Stores.css';
import { useLocation } from 'react-router-dom';
import { NotificationContainer } from '../../../toastifyServer';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Firebase
import { getStores } from '../../../firebase/stores';

// Icons
import { IonIcon } from '@ionic/react';
import { 
  shirt, footsteps, fastFood, home, phonePortrait, gameController, bed, library, colorPalette, football, car, construct, 
  paw, search, apps, swapVertical, arrowForward, arrowBack,
  star,
  personCircle
} from 'ionicons/icons';

export default function Stores() {

    const location = useLocation();
    const path = location.pathname;

    const formatName = (name, maxLength = 20) => {
        return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
    };
    
    function gerarCode(nome) {
        return nome
          .normalize("NFD") // Normaliza a string para decompor os acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
          .replace(/[^a-zA-Z0-9\s]/g, '-') // Substitui caracteres especiais por '-'
          .replace(/\s+/g, '-') // Substitui espaços por '-'
          .toLowerCase(); // Transforma tudo em minúsculas
    }

    const storesList = [
        { code: 'limar-automoveis', stars: 4.5, nome: 'Limar Automóveis', foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfaW9e8C6_eh5MtgDxYHLypzaq84EOfJanfw&s' },
        { code: 'nineteen', stars: 4.8, nome: 'Nineteen', foto: 'https://img.freepik.com/vetores-premium/logotipo-da-concessionaria-de-carros-de-aluguel-de-carros-com-contorno-do-carro-e-vetor-de-escudo_755061-122.jpg' },
        { code: 'autoracing', stars: 4.8, nome: 'Autoracing', foto: 'https://img.freepik.com/vetores-premium/projeto-de-showroom-de-carros-esportivos-concept-car-silhouette-auto-logotipo-da-concessionaria-de-veiculos-motorizados-de-desempenho_498574-192.jpg?w=360' },
    ];

    const [carregando, setCarregando] = useState(true);
    const [inputSearch, setInputSearch] = useState('');
    const [stores, setStores] = useState([]);

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
        <main className='container-stores'>
            <Navbar />
            <section className='content-stores'>
                <div className='router'>
                    <p>Mercado Digital / <strong>Concessionárias</strong> </p>
                </div>
                <h1>Os melhores preços em mais de <strong>{stores.length} concessionárias!</strong></h1>
                <p>Encontre o carro dos seus sonhos com as melhores ofertas e condições de empresas confiáveis</p>
                <div className='search'>
                    <div className='input'>
                        <input value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} placeholder='Busque por concessionárias' type='text' />
                        <IonIcon icon={search} className='icon' />
                    </div>
                    {inputSearch.length > 0 && (
                        <p>Principais resultados para: <strong>"{inputSearch}"</strong></p>
                    )}
                    <div className='stores'>
                        {carregando && (
                            [0, 1, 2, 3, 4].map((val, i) => (
                                <div className='store loading' key={i}></div>
                            ))
                        )}
                        {stores.length && !carregando ? (
                            stores
                                .filter(store => store.nome.toLowerCase().includes(inputSearch.toLowerCase())) // Primeiro filtra as lojas
                                .map((store, i) => (
                                    <div onClick={() => window.location.href = `/concessionaria/${gerarCode(store.nome)}`} className='store' key={i}>
                                        {store.foto ? (
                                            <div className='image' style={{ backgroundImage: `url(${store.foto})` }}></div>
                                        ) : (
                                            <IonIcon icon={personCircle} className='icon' />
                                        )}
                                        <h1>{formatName(store.nome, 30)}</h1>
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
                </div>
            </section>
            <Footer />
        </main>
    );
}