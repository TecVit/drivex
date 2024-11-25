import React, { useEffect, useState } from 'react';
import './css/Cadastrar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationContainer, notifyError, notifyInfo, notifySuccess } from '../../toastifyServer';
import Navbar from '../components/Navbar';
import Icon from '../../image/icon.png';
import axios from 'axios';

// Icons
import { IonIcon } from '@ionic/react';
import { person, arrowBack, storefront, checkmarkCircle, eye, eyeOff } from 'ionicons/icons';
import { FcGoogle } from 'react-icons/fc';
import { auth, cadastrarComEmail, cadastrarComGoogle, firestore } from '../../firebase/login';
import { clearCookies, getCookie, setCookie } from '../../firebase/cookies';
import { updateStoresAPI } from '../../firebase/stores';

export default function CadastrarStore() {

    function gerarCode(nome) {
        return nome
          .normalize("NFD") // Normaliza a string para decompor os acentos
          .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
          .replace(/[^a-zA-Z0-9\s]/g, '-') // Substitui caracteres especiais por '-'
          .replace(/\s+/g, '-') // Substitui espaços por '-'
          .toLowerCase(); // Transforma tudo em minúsculas
    }

    const navigate = useNavigate();

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nomeCookie = getCookie('nome') || '';
    const fotoCookie = getCookie('foto') || '';
    const emailCookie = getCookie('email') || '';

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged( async function(user) {
            if (user) {
                if (user.email && emailCookie === user.email || user.uid && uidCookie === user.uid) {
                    const docUser = await firestore.collection('stores')
                    .doc(user.uid).get();
                    
                    if (docUser.exists) {
                        const data = docUser.data();
                        if (!data.informacoesCompleta) {
                            setMdAccount(false);
                            setMdInformations(true);
                        }
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [uidCookie, emailCookie]);


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
        setInputTelefone(inputFormatado);
    };

    const consultarCNPJ = async (cnpjFormatado) => {
        try {
            const apenasNumeros = cnpjFormatado.replace(/[^\d]/g, '');
            if (apenasNumeros.length !== 14) {
                notifyError("CNPJ inválido. Deve ter 14 dígitos.");
                return;
            }
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${apenasNumeros}`);
            if (response.data && response.data.cep) {
                await formatarCEP(response.data.cep);
            } else {
                notifyError('Não encontramos informações nesse CNPJ, verifique novamente');
                return false;
            }
            setDataCNPJ(response.data);
            setInputNome(response.data.razao_social);
        } catch (error) {
            notifyError('CNPJ inválido, verifique novamente');
            setDataCNPJ(null);
        }
    };

    const [maxLimit, setMaxLimit] = useState(0);
    const [lastConsultTime, setLastConsultTime] = useState(Date.now());
    let timeoutLimit;

    const formatarCNPJ = async (input) => {
        const apenasNumeros = input.replace(/\D/g, "").slice(0, 14);
        let formatado = apenasNumeros;
    
        if (apenasNumeros.length >= 3) {
            formatado = `${apenasNumeros.substring(0, 2)}.${apenasNumeros.substring(2, 5)}`;
        }
        if (apenasNumeros.length >= 6) {
            formatado = `${formatado}.${apenasNumeros.substring(5, 8)}`;
        }
        if (apenasNumeros.length >= 9) {
            formatado = `${formatado}/${apenasNumeros.substring(8, 12)}`;
        }
        if (apenasNumeros.length > 12) {
            formatado = `${formatado}-${apenasNumeros.substring(12, 14)}`;
        }

        setInputCNPJ(formatado);
        
        if (apenasNumeros.length === 14) {
            const currentTime = Date.now();
            const timeDifference = currentTime - lastConsultTime;

            if (timeDifference >= 10000) {
                setMaxLimit(0);
                setLastConsultTime(currentTime);
            }
    
            if (maxLimit >= 2) {
                const remainingTime = 10 - Math.floor(timeDifference / 1000); // Tempo restante em segundos
                notifyInfo(`Espere ${remainingTime} segundos antes de tentar novamente.`);
                return;
            }
    
            setMaxLimit(prev => prev + 1);
            await consultarCNPJ(apenasNumeros);
    
            clearTimeout(timeoutLimit);
                timeoutLimit = setTimeout(() => {
                setMaxLimit(0);
            }, 15000);
        }
    };
    
    const handleChangeCNPJ = async (event) => {
        const input = event.target.value;
        await formatarCNPJ(input);
    };

    const formatarCEP = async (input) => {
        const apenasNumeros = input.replace(/\D/g, "").slice(0, 8);
        const inputAtual = inputCEP || "";
        
        if (apenasNumeros.length <= 0) {
            setInputCEP(0);
            setMdCEP(false);
            setDataCEP({});
        }
    
        let formatado = apenasNumeros;
        if (apenasNumeros.length >= 5) {
            formatado = `${apenasNumeros.substring(0, 5)}-${apenasNumeros.substring(5, 8)}`;
        }
        
        setInputCEP(formatado);
        if (apenasNumeros.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
                if (response.data.erro) {
                    setMdCEP(false);
                    setValidCNPJ(false);
                    return;
                }
                setMdCEP(true);
                setValidCNPJ(true);
                setDataCEP(response.data);
            } catch (error) {
                console.error("Erro ao buscar o CEP:", error);
            }
        } else {
            setMdCEP(false);
            setDataCEP({});
        }
    };    
    
    const handleChangeCEP = async (event) => {
        formatarCEP(event.target.value);
    };

    const verifyRequirementsPassword = (password) => {
        const requisitosAtualizados = [false, false, false, false];
        if (password.length >= 8) requisitosAtualizados[0] = true;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) requisitosAtualizados[1] = true;
        if (/\d/.test(password)) requisitosAtualizados[2] = true;
        if (/[#*&#@!.\-]/.test(password)) requisitosAtualizados[3] = true;
        return requisitosAtualizados;
    };

    const handleChangePassword = (event) => {
        const newPassword = event.target.value;
        setInputPassword(newPassword);
        setRequirementsPassword(verifyRequirementsPassword(newPassword));
    };

    const location = useLocation();
    const path = location.pathname;

    // Modais
    const [carregando, setCarregando] = useState(false);

    // Account
    const [mdAccount, setMdAccount] = useState(true);
    const [inputEmail, setInputEmail] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputConfirmPassword, setInputConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [requirementsPassword, setRequirementsPassword] = useState([false, false, false, false]);

    // Informations
    const [mdInformations, setMdInformations] = useState(false);
    const [inputCNPJ, setInputCNPJ] = useState('');
    const [validCNPJ, setValidCNPJ] = useState(false);
    const [dataCNPJ, setDataCNPJ] = useState('');
    const [inputNome, setInputNome] = useState('');
    const [inputTelefone, setInputTelefone] = useState('');
    const [inputCEP, setInputCEP] = useState('');
    const [dataCEP, setDataCEP] = useState('');
    const [inputNumberCEP, setInputNumberCEP] = useState('');
    const [mdCEP, setMdCEP] = useState(false);

    // Success
    const [mdSuccess, setMdSuccess] = useState(true);
    
    const handleNextStep = async () => {
        if (carregando) {
            notifyInfo('Aguarde a ultima requisição terminar');
            return;
        }
        if (inputPassword !== inputConfirmPassword) {
            notifyError('Senhas não são iguais');
            return;
        }
        setCarregando(true);
        try {
            if (inputEmail && requirementsPassword.every(value => value === true)) {
                try {
                    const response = await cadastrarComEmail(inputEmail, inputPassword, 'store');
                    if (response === 'sucesso') {
                        setMdAccount(false);
                        setMdInformations(true);
                        return true;
                    } else if (response === 'credenciais-invalidas') {
                        notifyError('Email ou Senha inválidos!');
                    } else if (response === 'email-invalido') {
                        notifyError('Email inválido!');
                    } else if (response === 'usuario-existe') {
                        notifyError('Usuário já existe!');
                    } else if (response === 'email-em-uso') {
                        notifyError('Você já possui uma conta com esse email! Faça login.');
                    } else {
                        notifyError('Houve algum erro!');
                    }
                    return false;
                } catch (error) {
                    notifyError('Erro ao criar a conta: ' + error.message);
                }
            } else {
                notifyError('Email ou senha inválidos');
            }
        } catch (error) {
            console.error(error);
            return;
        } finally {
            setCarregando(false);
        }
    }

    const handleNextStepGoogle = async () => {
        if (carregando) {
            notifyInfo('Aguarde a ultima requisição terminar');
            return;
        }
        setCarregando(true);
        try {
            const response = await cadastrarComGoogle('store');
    
            if (response === 'sucesso') {
                notifySuccess('Cadastro realizado com sucesso! Complete suas informações.');
                setMdInformations(true);
                setMdAccount(false);
                return true;
            } else if (response === 'usuario-existe') {
                notifyError('Você já possui uma conta! Faça login.');
            } else if (response === 'popup-fechou') {
                notifyError('O pop-up foi fechado. Tente novamente.');
            } else if (response === 'email-em-uso') {
                notifyError('Você já possui uma conta com esse email! Faça login.');
            } else {
                notifyError('Ocorreu um erro durante o cadastro.');
            }

            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setCarregando(false);
        }
        
    };

    const handleFinishRegister = async () => {
        if (carregando) {
            notifyInfo('Aguarde a ultima requisição terminar');
            return;
        }
        setCarregando(true);
        try {
            
            const userId = auth.currentUser.uid;
        
            if (!userId) {
                notifyError('Usuário não está autenticado.');
                return;
            }
            
            if (!inputNome || !inputCNPJ || !inputTelefone || !inputCEP) {
                notifyError('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Verify informations
            if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(inputTelefone)) {
                notifyError('Telefone incompleto');
                return;
            }
            if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(inputCNPJ) || !validCNPJ) {
                notifyError('CNPJ inválido');
                return;
            }
            if (!/^\d{5}-\d{3}$/.test(inputCEP)) {
                notifyError('CEP inválido');
                return;
            }
            if (inputCEP && dataCEP?.ddd !== '16') {
                notifyError('Sua concessionária não é da região com o DDD (16)');
                notifyInfo(`CEP: ${inputCEP} - DDD: (${dataCEP?.ddd})`)
                return;
            }
            
            let dadosAtualizados = {
                nome: inputNome,
                telefone: inputTelefone,
                cep: inputCEP,
                cnpj: inputCNPJ,
                numeroResidencia: (inputNumberCEP && !isNaN(inputNumberCEP)) ? inputNumberCEP : false,
                estado: dataCEP?.estado,
                cidade: dataCEP?.localidade,
                bairro: dataCEP?.bairro,
                rua: dataCEP?.logradouro,
                ddd: dataCEP?.ddd,
                informacoesCompleta: true,
                foto: fotoCookie,
                isUpdated: false,
            };

            Object.keys(dadosAtualizados).forEach((key) => {
                if (dadosAtualizados[key] === undefined) {
                    delete dadosAtualizados[key];
                }
            });

            const storeDoc = await firestore.collection('store').doc(gerarCode(inputNome)).get();

            if (storeDoc.exists) {
                notifyError('Já existe uma concessionária com esse nome');
                return;
            }

            await firestore.collection('store').doc(gerarCode(inputNome)).set(dadosAtualizados, { merge: true });
            delete dadosAtualizados['isUpdated'];
            
            await firestore.collection('stores').doc(userId).update(dadosAtualizados);
            
            const success = await updateStoresAPI();

            if (success) {
                notifySuccess('Cadastro concluído com sucesso!');
                setMdInformations(false);
                setMdAccount(true);
    
                setTimeout(() => {
                    navigate("/perfil");
                }, 3750);
    
                return true;
            }

            return false;
        } catch (error) {
            notifyError('Erro ao salvar informações: ' + error.message);
        } finally {
            setCarregando(false);
        }
    } 

    return (
        <main className='container-cadastrar-store'>
            <Navbar />
            <section className='content-cadastrar-store'>
                {mdAccount && (
                    <div className='form'>
                        <Link to="/">
                            <IonIcon icon={arrowBack} className='icon' />
                            Voltar para o início
                        </Link>
                        <h1>Crie uma conta do DriveX</h1>
                        <div className='input'>
                            <label>E-mail</label>
                            <input value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} placeholder='Digite o seu e-mail' type='text' />
                        </div>
                        <div className='input'>
                            <label>Senha</label>
                            <input value={inputPassword} onChange={handleChangePassword} placeholder='Digite a sua senha' type={showPassword ? 'text' : 'password'} />
                            {showPassword ? (
                                <IonIcon onClick={() => setShowPassword(false)} icon={eye} className='eye' />
                            ) : (
                                <IonIcon onClick={() => setShowPassword(true)} icon={eyeOff} className='eye' />
                            )}
                        </div>

                        <div className='info-password'>
                            <p>Sua senha deve ter:</p>
                            <li className={requirementsPassword[0] ? "green" : ""}>
                                <IonIcon className='icon' icon={checkmarkCircle} />
                                <p>8 ou mais caracteres</p>
                            </li>
                            <li className={requirementsPassword[1] ? "green" : ""}>
                                <IonIcon className='icon' icon={checkmarkCircle} />
                                <p>Letras maiúsculas e minúsculas</p>
                            </li>
                            <li className={requirementsPassword[2] ? "green" : ""}>
                                <IonIcon className='icon' icon={checkmarkCircle} />
                                <p>Pelo menos um número</p>
                            </li>
                            <li className={requirementsPassword[3] ? "green" : ""}>
                                <IonIcon className='icon' icon={checkmarkCircle} />
                                <p>Pelo menos um caracter especial (#, *, &, @, !, .)</p>
                            </li>
                        </div>
                        
                        <div className='input'>
                            <label>Confirmar a senha</label>
                            <input value={inputConfirmPassword} onChange={(e) => setInputConfirmPassword(e.target.value)} placeholder='Digite sua senha novamente' type={showPassword ? 'text' : 'password'} />
                            {showPassword ? (
                                <IonIcon onClick={() => setShowPassword(false)} icon={eye} className='eye' />
                            ) : (
                                <IonIcon onClick={() => setShowPassword(true)} icon={eyeOff} className='eye' />
                            )}
                        </div>
                        
                        <button onClick={handleNextStep}>
                            {carregando ? (
                                <div className='loader'></div>
                            ) : (
                                <>
                                    Próxima etapa
                                </>
                            )}
                        </button>

                        <div className='or'>
                            <div></div>
                            <p>OU</p>
                            <div></div>
                        </div>

                        <button onClick={handleNextStepGoogle} className='btn-google'>
                            {carregando ? (
                                <div className='loader'></div>
                            ) : (
                                <>
                                    <FcGoogle className='icon' />
                                    Cadastrar com Google
                                </>
                            )}
                        </button>

                        <div className='others'>
                            <p>Já possui uma conta?</p>
                            <Link to="/entrar">
                                Acessar área de login
                            </Link>
                        </div>
                    </div>
                )}

                {mdInformations && (
                    <div className='form'>
                        <a onClick={() => {
                            setMdAccount(true);
                            setMdInformations(false);
                        }}>
                            <IonIcon icon={arrowBack} className='icon' />
                            Voltar para a etapa anterior
                        </a>
                        <h1>Vamos lá! Preencha seus dados pessoais</h1>
                        <div className='input'>
                            <label>CNPJ</label>
                            <input value={inputCNPJ} onChange={handleChangeCNPJ} placeholder='00.000.000/0000-00' type='text' />
                        </div>
                        <div className='input'>
                            <label>Nome fantasia ou Razão social</label>
                            <input value={inputNome} onChange={(e) => setInputNome(e.target.value)} placeholder='Digite o nome da empresa' type='text' />
                        </div>
                        <div className='input'>
                            <label>Telefone</label>
                            <input value={inputTelefone} onChange={handleChangeTelefone} placeholder='( ) _____-____' type='text' />
                        </div>
                        <div className='input'>
                            <label>CEP</label>
                            <input value={inputCEP} onChange={handleChangeCEP} placeholder='00000-000' type='text' />
                        </div>

                        {mdCEP && (
                            <>
                                <div className='input'>
                                    <label>Estado</label>
                                    <input value={dataCEP.estado} disabled placeholder='Seu estado' type='text' />
                                </div>
                                <div className='input'>
                                    <label>Cidade</label>
                                    <input value={dataCEP.localidade} disabled placeholder='Sua cidade' type='text' />
                                </div>
                                <div className='input'>
                                    <label>Bairro</label>
                                    <input value={dataCEP.bairro} disabled placeholder='Sua cidade' type='text' />
                                </div>
                                <div className='input'>
                                    <label>Rua</label>
                                    <input value={dataCEP.logradouro} disabled placeholder='Sua cidade' type='text' />
                                </div>
                                <div className='input'>
                                    <label>Número</label>
                                    <input value={inputNumberCEP} onChange={(e) => setInputNumberCEP(e.target.value)} placeholder='Número da residencia' type='number' />
                                </div>
                            </>
                        )}

                        <button onClick={handleFinishRegister}>
                            {carregando ? (
                                <div className='loader'></div>
                            ) : (
                                <>Concluir cadastro</>
                            )}
                        </button>
                    </div>
                )}
            </section>
            <footer className='terms'>
                <Link to="/termos-de-uso">
                    Termos de uso
                </Link>
                <Link to="/politica-de-privacidade">
                    Política de privacidade
                </Link>
            </footer>
        </main>
    )
}