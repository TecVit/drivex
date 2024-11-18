import React, { useEffect, useState } from 'react';
import './css/Cadastrar.css';
import { useLocation } from 'react-router-dom';
import { NotificationContainer, notifyError, notifyInfo, notifySuccess } from '../../../toastifyServer';
import Navbar from '../../components/Navbar';
import Icon from '../../../image/icon.png';
import axios from 'axios';

// Icons
import { IonIcon } from '@ionic/react';
import { person, arrowBack, storefront, checkmarkCircle, eye, eyeOff } from 'ionicons/icons';
import { FcGoogle } from 'react-icons/fc';
import { auth, cadastrarComEmail, cadastrarComGoogle, firestore } from '../../../firebase/login';
import { clearCookies, getCookie, setCookie } from '../../../firebase/cookies';

export default function CadastrarClient() {

    // Dados
    const uidCookie = getCookie('uid') || '';
    const nomeCookie = getCookie('nome') || '';
    const fotoCookie = getCookie('foto') || '';
    const emailCookie = getCookie('email') || '';

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged( async function(user) {
            if (user) {
                if (user.email && emailCookie === user.email || user.uid && uidCookie === user.uid) {
                    const docUser = await firestore.collection('users')
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


    const formatarDataNascimento = (input) => {
        const apenasNumeros = input.replace(/\D/g, "");
    
        let formatado = apenasNumeros
          .replace(/^(\d{2})(\d)/, "$1/$2")
          .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
    
        return formatado.substring(0, 10);
    };

    const handleChangeDataNascimento = (event) => {
        const inputFormatado = formatarDataNascimento(event.target.value);
        setInputDataNascimento(inputFormatado);
    };

    const formatarCEP = async (input) => {
        const apenasNumeros = input.replace(/\D/g, "").slice(0, 8);
        const inputAtual = inputCEP || "";
        if (apenasNumeros.length <= inputAtual.replace(/\D/g, "").length) {
            setInputCEP(apenasNumeros);
            return;
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
                    return;
                }
                setMdCEP(true);
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
    const [inputNome, setInputNome] = useState('');
    const [inputDataNascimento, setInputDataNascimento] = useState('');
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
                    const response = await cadastrarComEmail(inputEmail, inputPassword, 'user');
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
            const response = await cadastrarComGoogle('user');
    
            if (response === 'sucesso') {
                notifySuccess('Cadastro realizado com sucesso! Complete suas informações.');
                setMdInformations(true);
                setMdAccount(false);
                return true;
            } else if (response === 'usuario-existe') {
                notifyError('Você já possui uma conta! Faça login.');
            } else if (response === 'email-em-uso') {
                notifyError('Você já possui uma conta com esse email! Faça login.');
            } else if (response === 'popup-fechou') {
                notifyError('O pop-up foi fechado. Tente novamente.');
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
            
            if (!inputNome || !inputDataNascimento || !inputCEP || !inputNumberCEP) {
                notifyError('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(inputDataNascimento)) {
                notifyError('Data de nascimento incompleta');
                return;
            }
            
            const dadosAtualizados = {
                nome: inputNome,
                dataNascimento: inputDataNascimento,
                cep: inputCEP,
                numeroResidencia: inputNumberCEP,
                estado: dataCEP?.estado,
                cidade: dataCEP?.localidade,
                bairro: dataCEP?.bairro,
                informacoesCompleta: true,
            };

            Object.keys(dadosAtualizados).forEach((key) => {
                if (dadosAtualizados[key] === undefined) {
                    delete dadosAtualizados[key];
                }
            });

            await firestore.collection('users').doc(userId).update(dadosAtualizados);
    
            notifySuccess('Cadastro concluído com sucesso!');
            setMdInformations(false);
            setMdAccount(true);

            setTimeout(() => {
                window.location.href = "/carrinho";
            }, 2500);

            return true;
        } catch (error) {
            notifyError('Erro ao salvar informações: ' + error.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className='container-cadastrar-client'>
            <Navbar />
            <section className='content-cadastrar-client'>
                {mdAccount && (
                    <div className='form'>
                        <a href="/cadastrar">
                            <IonIcon icon={arrowBack} className='icon' />
                            Voltar para seleção de perfil
                        </a>
                        <h1>Crie uma conta do Mercado Digital</h1>
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
                            <a href='/entrar'>Acessar área de login</a>
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
                            <label>Nome e sobrenome</label>
                            <input value={inputNome} onChange={(e) => setInputNome(e.target.value)} placeholder='Digite seu nome completo' type='text' />
                        </div>
                        <div className='input'>
                            <label>Data de nascimento</label>
                            <input value={inputDataNascimento} onChange={handleChangeDataNascimento} placeholder='__/__/____' type='text' />
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
                <a href='/termos-de-uso'>Termos de uso</a>
                <a href='/politica-de-privacidade'>Política de privacidade</a>
            </footer>
        </main>
    )
}