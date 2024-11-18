import React, { useEffect, useState } from 'react';
import './css/Products.css';
import { useLocation } from 'react-router-dom';
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


export default function Produtos() {
    const location = useLocation();
    const path = location.pathname;

    const storesList = [
        { code: 'burger-king', stars: 4.5, nome: 'Burger King', foto: 'https://burgerking.com.br/images/bklogos/BK-novo-logo.svg' },
        { code: 'mc-donalds', stars: 4.1, nome: 'McDonald\'s', foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRjLWhWpx9PfbzysffLbMA_DK_8jawJAVHbw&s' },
        { code: 'starbucks', stars: 4.8, nome: 'Starbucks', foto: 'https://starbucksathome.com/br/static/version1730292575/frontend/Webjump/starbucks/pt_BR/images/logo.svg' },
        { code: 'subway', stars: 3.5, nome: 'Subway', foto: 'https://subway.com/-/media/Base_English/Images/Branding/subway-logo-new.png?h=44&iar=0&w=222&hash=CDB124300E029828BEC5C9C3D48FB55D' },
        { code: 'kfc', stars: 2.5, nome: 'KFC', foto: 'http://cupons.kfcbrasil.com.br/wp-content/uploads/2024/03/KFC_Wordmark_RGB_Red.png' },
        { code: 'habibs', stars: 3.25, nome: 'Habib\'s', foto: 'https://upload.wikimedia.org/wikipedia/pt/b/b1/Novo-logo.png' },
        { code: 'bobs', stars: 2.65, nome: 'Bob\'s', foto: 'https://www.bobs.com.br/assets/img/logo-bobs.svg' },
        { code: 'spoleto', stars: 1.5, nome: 'Spoleto', foto: 'https://www.spoleto.com.br/assets/img/logo-spoleto.svg' },
        { code: 'outback', stars: 4.75, nome: 'Outback', foto: 'https://play-lh.googleusercontent.com/OgmB8fs_nOvRuoq9V3f6Nj2n5FAvyX_muX703aNgmDdnRGeE8LPw7dT8jmNG5Xvro6E' },
        { code: 'dominos-pizza', stars: 3.15, nome: 'Domino\'s Pizza', foto: 'https://www.dominos.com.br/assets/img/logo-dominos.svg' }
    ];

    const [inputSearch, setInputSearch] = useState('');
    const [stores, setStores] = useState(storesList);

    useEffect(() => {
        const filteredStores = storesList.filter(store => store.nome.toLowerCase().includes(inputSearch.toLowerCase()));
        setStores(filteredStores);
    }, [inputSearch]);

    const categoriesAll = [
        { name: "Roupas e Acessórios", icon: <IonIcon icon={shirt} className="icon" /> },
        { name: "Calçados", icon: <IonIcon icon={footsteps} className="icon" /> },
        { name: "Alimentos e Bebidas", icon: <IonIcon icon={fastFood} className="icon" /> },
        { name: "Eletrodomésticos", icon: <IonIcon icon={home} className="icon" /> },
        { name: "Tecnologia e Eletrônicos", icon: <IonIcon icon={phonePortrait} className="icon" /> },
        { name: "Brinquedos e Jogos", icon: <IonIcon icon={gameController} className="icon" /> },
        { name: "Móveis e Decoração", icon: <IonIcon icon={bed} className="icon" /> },
        { name: "Livros e Papelaria", icon: <IonIcon icon={library} className="icon" /> },
        { name: "Beleza e Cosméticos", icon: <IonIcon icon={colorPalette} className="icon" /> },
        { name: "Esportes e Lazer", icon: <IonIcon icon={football} className="icon" /> },
        { name: "Automotivo", icon: <IonIcon icon={car} className="icon" /> },
        { name: "Materiais de Construção e Ferragens", icon: <IonIcon icon={construct} className="icon" /> },
        { name: "Pet Shop", icon: <IonIcon icon={paw} className="icon" /> }
    ];

    let NUM_MAX_CATEGORIES = 4;
    const [maxCategories, setMaxCategories] = useState(NUM_MAX_CATEGORIES);
    const [categories, setCategories] = useState(categoriesAll.slice(0, maxCategories));

    const handleMoreCategories = () => {
        if (maxCategories + NUM_MAX_CATEGORIES <= categoriesAll.length) {
            const newMaxCategories = maxCategories + NUM_MAX_CATEGORIES;
            setMaxCategories(newMaxCategories);
            setCategories(categoriesAll.slice(0, newMaxCategories));
        } else {
            setMaxCategories(categoriesAll.length);
            setCategories(categoriesAll.slice(0, categoriesAll.length));
        }
    };
    
    const handleLessCategories = () => {
        setMaxCategories(NUM_MAX_CATEGORIES);
        setCategories(categoriesAll.slice(0, NUM_MAX_CATEGORIES));
    };


    // Stores
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;
  
    const nextStore = () => {
      if (currentIndex + itemsPerPage < stores.length) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    const prevStore = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
  
    
    return (
        <main className='container-products'>
            <Navbar />
            <section className='content-products'>
                <div className='router'>
                    <p>Mercado Digital / <strong>Produtos</strong> </p>
                </div>
                <h1>Os melhores produtos em mais de <strong>64 empresas!</strong></h1>
                <p>Economize na sua compra aproveitando as melhores ofertas e cupons de empresas confiáveis</p>
                <article className='categories'>
                    {categories.length > 0 && (
                        categories.map((val, i) => (
                            <div key={i} className='category'>
                                {val.icon}
                                <p>{val.name}</p>
                            </div>      
                        ))
                    )}
                    {categories.length === categoriesAll.length ? (
                        <div onClick={handleLessCategories} className='category'>
                            <IonIcon icon={swapVertical} className='icon' />
                            <p>Mostrar Menos</p>
                        </div>
                    ) : (
                        <div onClick={handleMoreCategories} className='category'>
                            <IonIcon icon={apps} className='icon' />
                            <p>Mostrar Mais</p>
                        </div>
                    )}
                </article>
                <div className='search'>
                    <div className='input'>
                        <input value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} placeholder='Busque por empresas' type='text' />
                        <IonIcon icon={search} className='icon' />
                    </div>
                    {inputSearch.length > 0 && (
                        <p>Principais resultados para: <strong>"{inputSearch}"</strong></p>
                    )}
                    <div className='stores'>
                        {stores.length ? (
                            stores.slice(currentIndex, currentIndex + itemsPerPage).length ? (
                                stores.slice(currentIndex, currentIndex + itemsPerPage).map((store, i) => (
                                    <div onClick={() => window.location.href =  `/empresa/${store.code}`} className='store' key={i}>
                                        <div className='image' style={{ backgroundImage: `url(${store.foto})` }}></div>
                                        <h1>{store.nome}</h1>
                                        <div className="stars">
                                            <IonIcon icon={star} className='star' />
                                            <p><strong>{store.stars}</strong> / 5</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Nenhuma loja encontrada para a sua pesquisa.</p>
                            )
                        ) : (
                            <p>Nenhuma loja encontrada.</p>
                        )} 
                        {stores.length > itemsPerPage && (
                            <>
                              <IonIcon onClick={prevStore} icon={arrowBack} className='arrow left desktop-500' />
                              <IonIcon onClick={nextStore} icon={arrowForward} className='arrow right desktop-500' />
                            </>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}