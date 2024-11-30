import React, { useEffect, useRef, useState } from 'react';
import './css/Profile.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NotificationContainer, notifyError, notifyInfo, notifySuccess } from '../../toastifyServer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Firebase
import { getStore, updateStoresAPI } from '../../firebase/stores';

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Popup from '../components/Popup';

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
  createOutline,
  logoWhatsapp,
  logoInstagram,
  logoFacebook
} from 'ionicons/icons';
import { clearCookies, getCookie } from '../../firebase/cookies';
import { auth, firestore, verificarUsuario } from '../../firebase/login';

export default function Profile() {

    const formatName = (name, maxLength = 20) => {
        return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
    };

    function formatPhoneNumber(phone) {
        return phone.replace(/\D/g, '');
    }

    async function gerarCode(nome) {
        return await nome
          .normalize("NFD") // Normaliza a string para decompor os acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
          .replace(/[^a-zA-Z0-9\s]/g, '-') // Substitui caracteres especiais por '-'
          .replace(/\s+/g, '-') // Substitui espaços por '-'
          .toLowerCase(); // Transforma tudo em minúsculas
    }

    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    // Dados
    const nomeCookie = getCookie('nome');
    const emailCookie = getCookie('email');
    const uidCookie = getCookie('uid');
    const fotoCookie = getCookie('foto');
    const [id, setId] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged( async function(user) {
            if (user) {
                if (user.email && emailCookie !== user.email || user.uid && uidCookie !== user.uid) {
                    notifyError('Não conseguimos identificar seu usuário, faça login novamente!');
                    await clearCookies();
                    localStorage.clear();
                    navigate('/entrar');
                } else {
                    const userDoc = await firestore.collection('private')
                    .doc(user.uid).get();
                    
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        if (data.nome === nomeCookie && data.email === emailCookie) {
                            const getId = await gerarCode(data.nome);
                            setId(getId);
                        } else {
                            notifyError('Não conseguimos identificar seu usuário, faça login novamente!');
                            await clearCookies();
                            localStorage.clear();
                            navigate('/entrar');
                        }
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [uidCookie, emailCookie]);
    
    // Modais
    const [carregando, setCarregando] = useState(true);
    const [mdBanner, setMdBanner] = useState(true);
    const [mdPopupEditar, setMdPopupEditar] = useState(false);

    // Inputs
    const [storeDataEdit, setStoreDataEdit] = useState({});
    const [inputFile, setInputFile] = useState(null);
    const handleInputFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setInputFile({
              name: file.name,
              type: file.type,
              fileObject: file,
            });
        }
    }

    const handleEditStoreData = (key, value) => {
        if (!storeDataEdit) return;
        setStoreDataEdit(prevState => ({
          ...prevState,
          [key]: value,
        }));
    };

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

    useEffect(() => {
        const getStoreData = async () => {
            setCarregando(true);
            try {
                const data = await getStore(id);
                if (data && Object.keys(data).length > 0) {
                    setStoreData(data);
                    setStoreDataEdit(data);
                    if (data.carros && data.carros.length > 0) {
                        setImages(data.carros);
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
        if (id) {
            getStoreData();
        }
    }, [id]);

    /*
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
    */

    const formatarCEP = async (input) => {
        const apenasNumeros = String(input || '').replace(/\D/g, "").slice(0, 8);
        
        let formatado = apenasNumeros;
        if (apenasNumeros.length >= 5) {
            formatado = `${apenasNumeros.substring(0, 5)}-${apenasNumeros.substring(5, 8)}`;
        }
        
        handleEditStoreData('cep', formatado);
        if (apenasNumeros.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
                if (response.data.erro) {
                    cleanEditCEP();
                    return;
                }
                const { uf: estado, localidade: cidade, bairro, logradouro: rua } = response.data;
                handleEditStoreData('estado', estado);
                handleEditStoreData('cidade', cidade);
                handleEditStoreData('bairro', bairro);
                handleEditStoreData('rua', rua);
            } catch (error) {
                console.error("Erro ao buscar o CEP:", error);
            }
        }
    };
    const cleanEditCEP = () => {
        handleEditStoreData('estado', '');
        handleEditStoreData('cidade', '');
        handleEditStoreData('bairro', '');
        handleEditStoreData('rua', '');
    }
    
    const handleChangeCEP = async (event) => {
        formatarCEP(event.target.value);
    };

    const formatarTelefone = (telefone) => {
        const apenasNumeros = telefone.replace(/\D/g, '').slice(0, 11);
        if (apenasNumeros.length === 0) {
            return '';
        } else if (apenasNumeros.length <= 2) {
            return `(${apenasNumeros}`;
        } else if (apenasNumeros.length <= 6) {
            return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2)}`;
        } else if (apenasNumeros.length > 7) {
            return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7)}`;
        }
    };

    const handleChangeTelefone = (event) => {
        const inputFormatado = formatarTelefone(event.target.value);
        handleEditStoreData('telefone', inputFormatado);
    };
    const handleChangeWhatsapp = (event) => {
        const inputFormatado = formatarTelefone(event.target.value);
        handleEditStoreData('whatsapp', inputFormatado);
    };
    
    const handleUploadImage = async () => {
        if (!inputFile) return alert("Por favor, selecione uma imagem.");

        setCarregando(true); // Inicia o carregamento

        const formData = new FormData();
        formData.append('image', inputFile.fileObject);

        try {
            let key = '541a03aa10ef76e54f0a9727d58526a2';
            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${key}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Resposta contendo a URL da imagem
            if (response.data.success) {
                let url = response.data.data.url;
                return url;
            } else {
                alert("Falha ao carregar a imagem.");
            }
        } catch (error) {
            console.error("Erro ao fazer o upload:", error);
            alert("Erro no upload da imagem.");
        } finally {
            setCarregando(false); // Finaliza o estado de carregamento
        }
    };

    const handleSave = async () => {
        if (carregando) {
            notifyInfo('Aguarde um momento..');
            return;
        }
        setCarregando(true);
        try {
            
            let dataNewSave = {
                ...storeDataEdit,
                isUpdated: false,
            }
            
            if (inputFile) {
                let url = await handleUploadImage();
                dataNewSave.foto = url;
            }
            
            const verifyUser = await verificarUsuario(uidCookie, emailCookie, nomeCookie);
            if (!verifyUser) {
                return;
            }

            let code = await gerarCode(nomeCookie);
            await firestore.collection('public').doc(code).update(dataNewSave, { merge: true });
            delete dataNewSave['isUpdated'];

            await firestore.collection('private').doc(uidCookie).update(dataNewSave);
            await updateStoresAPI();
            
            notifySuccess('Dados salvos com sucesso');
            setStoreData(dataNewSave);
            setMdPopupEditar(false);
            
            return true;

        } catch (error) {
            console.error(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <Navbar />
            {storeData && Object.keys(storeData).length > 0 && !carregando && (
                <main className='container-profile' style={{ backgroundColor: storeData?.background }}>
                
                    <section className={`content-profile`}>
                        <div className='profile'>
                            <div className='person'>
                                {storeData.foto ? (
                                    <div className='logo' style={{ backgroundImage: `url(${storeData.foto})` }}></div>
                                ) : (
                                    <IonIcon className='logo icon' icon={personCircle} />
                                )}
                                <h1>{storeData.nome}</h1>
                            </div>
                            <button onClick={() => {
                                setMdPopupEditar(true);
                            }} className='btn-one'>Editar Dados</button>
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

                    <section className="content-profile">
                        <div className='text'>
                            <h1>Todos os Carros</h1>
                            <button className='btn-one'>Adicionar novo carro</button>
                        </div>
                        <div className='cars'>
                            {storeData.carros && storeData.carros.length > 0 ? (
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
                            
                    {/* Mapa */}
                    {storeData?.cep  && (
                        <section className='content-profile'>
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
                <main className='container-profile'>
                    
                    <section className={`content-profile`}>
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

                    <section className="content-profile">
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
                    <section className='content-profile'>
                        <div className='text'>
                            <h1>Local da concessionária</h1>
                        </div>
                        <div className='map loading'></div>
                    </section>
                    
                    <Footer />
                </main>
            )}
            
              {/* Popups */}
              {mdPopupEditar && (
                <Popup handleClose={() => setMdPopupEditar(false)} handleSave={handleSave} title="Editar dados do perfil" loading={carregando}>
                    <div className='form'>
                        <div className='file'>
                            <div className='input-file'>
                                <input onChange={handleInputFile} accept='image/*' type='file' />
                                {inputFile ? (
                                    <img className='content' src={URL.createObjectURL(inputFile.fileObject)} />
                                ) : (
                                    <div className='content'>
                                        <p>Arquívo</p>
                                    </div>
                                )}
                            </div>
                            <div className='text'>
                                <h1>
                                    {inputFile ? (
                                        <>Foto de Perfil: {inputFile.name}</>
                                    ) : (
                                        <>Selecione um arquivo</>
                                    )}
                                </h1>
                                <p>
                                    {inputFile ? (
                                        <>{inputFile.type}</>
                                    ) : (
                                        <>Nenhum tipo de arquivo encontrado</>
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        <div className='input'>
                            <label>Nome</label>
                            <input disabled maxLength={60} value={storeDataEdit.nome} placeholder='Nome da empresa' type='text' />
                        </div>

                        <div className='input'>
                            <label>CNPJ</label>
                            <input disabled maxLength={60} value={storeDataEdit.cnpj} placeholder='00.000.000/0000-00' type='text' />
                        </div>

                        <div className='input'>
                            <label>Telefone</label>
                            <input maxLength={60} onChange={handleChangeTelefone} value={storeDataEdit.telefone} placeholder='(00) 00000-0000' type='text' />
                        </div>

                        <div className='input'>
                            <label>Número do Whatsapp</label>
                            <input maxLength={60} onChange={handleChangeWhatsapp} value={storeDataEdit.whatsapp} placeholder='(00) 00000-0000' type='text' />
                        </div>

                        <div className='input'>
                            <label>Link do Instagram</label>
                            <input maxLength={60} onChange={(e) => handleEditStoreData('instagram', e.target.value)} value={storeDataEdit.instagram} placeholder='https://instagram.com/drivex.com.br' type='text' />
                        </div>

                        <div className='input'>
                            <label>Link do Facebook</label>
                            <input maxLength={60} onChange={(e) => handleEditStoreData('facebook', e.target.value)} value={storeDataEdit.facebook} placeholder='https://facebook.com/drivex.com.br' type='text' />
                        </div>

                        <div className='input'>
                            <label>CEP</label>
                            <input maxLength={60} onChange={handleChangeCEP} value={storeDataEdit.cep} placeholder='00000-000' type='text' />
                        </div>

                        {storeDataEdit.estado && storeDataEdit.cidade && storeDataEdit.bairro && storeDataEdit.rua && (
                            <>
                                <div className='input'>
                                    <label>Estado</label>
                                    <input disabled maxLength={60} value={storeDataEdit.estado} type='text' />
                                </div>

                                <div className='input'>
                                    <label>Cidade</label>
                                    <input disabled maxLength={60} value={storeDataEdit.cidade} type='text' />
                                </div>

                                <div className='input'>
                                    <label>Bairro</label>
                                    <input disabled maxLength={60} value={storeDataEdit.bairro} type='text' />
                                </div>

                                <div className='input'>
                                    <label>Rua</label>
                                    <input disabled maxLength={60} value={storeDataEdit.rua} type='text' />
                                </div>

                                <div className='input'>
                                    <label>Numero</label>
                                    <input maxLength={60} onChange={(e) => handleEditStoreData('numeroResidencia', e.target.value)} value={storeDataEdit.numeroResidencia} placeholder='Numero da residência (Opcional)' type='text' />
                                </div>
                            </>
                        )}

                    </div>
                </Popup>
            )}

        </>
    );
}