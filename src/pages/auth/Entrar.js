import React, { useState } from 'react';
import './css/Entrar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notifyError, notifyInfo, notifySuccess } from '../../toastifyServer';
import Navbar from '../components/Navbar';
import Icon from '../../image/icon.png';

// Icons
import { IonIcon } from '@ionic/react';
import { person, arrowBack, storefront, eye, eyeOff } from 'ionicons/icons';
import { FcGoogle } from 'react-icons/fc';
import { entrarComEmail, entrarComGoogle } from '../../firebase/login';
import { getCookie } from '../../firebase/cookies';

export default function EntrarStore() {

    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    // Modais
    const [carregando, setCarregando] = useState(false);

    // Inputs
    const [inputEmail, setInputEmail] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEntrar = async () => {
        if (carregando) {
            notifyInfo('Aguarde a ultima requisição terminar');
            return;
        }
        setCarregando(true);
        try {
            if (!inputEmail || !inputPassword) {
                notifyError('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }
            if (inputPassword && inputPassword.length < 6) {
                notifyInfo('A senha deve conter no mínimo 6 caracteres.');
                return false;
            }
            const response = await entrarComEmail(inputEmail, inputPassword, 'store');
            if (response === 'sucesso') {
                notifySuccess(`Bem-Vindo novamente, ${getCookie('nome')}!`);
                setTimeout(() => {
                    navigate("/perfil");
                }, 3750);
                return true;
            } else if (response === 'credenciais-invalidas') {
                notifyError('Email ou Senha inválidos!');
            } else if (response === 'email-invalido') {
                notifyError('Email inválido!');
            } else if (response === 'usuario-nao-existe') {
                notifyError('Concessionária não existe!');
            } else if (response === 'cadastro-incompleto') {
                notifyInfo('Complete seu cadastro');
                setTimeout(() => {
                    navigate("/cadastrar");
                }, 3750);
            } else {
                notifyError('Houve algum erro!');
            }

            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setCarregando(false);
        }
    };

    const handleEntrarGoogle = async () => {
        if (carregando) {
            notifyInfo('Aguarde a ultima requisição terminar');
            return;
        }
        setCarregando(true);
        try {
            const response = await entrarComGoogle('store');
            if (response === 'sucesso') {
                notifySuccess(`Bem-Vindo novamente, ${getCookie('nome')}!`);
                setTimeout(() => {
                    navigate("/perfil");
                }, 3750);
                return true;
            } else if (response === 'credenciais-invalidas') {
                notifyError('Email ou Senha inválidos!');
            } else if (response === 'email-invalido') {
                notifyError('Email inválido!');
            } else if (response === 'usuario-nao-existe') {
                notifyError('Concessionária não existe!');
            } else if (response === 'cadastro-incompleto') {
                notifyInfo('Complete seu cadastro');
                setTimeout(() => {
                    navigate("/cadastrar");
                }, 3750);
            } else {
                notifyError('Houve algum erro!');
            }

            return false;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setCarregando(false);
        }
    };
 
    return (
        <main className='container-entrar-store'>
            <Navbar />
            <section className='content-entrar-store'>
                <div className='form'>
                    <Link to="/">
                        <IonIcon icon={arrowBack} className='icon' />
                        Voltar para o início
                    </Link>
                    <h1>Entre na sua conta do DriveX</h1>
                    <div className='input'>
                        <label>E-mail</label>
                        <input onChange={(e) => setInputEmail(e.target.value)} placeholder='Digite o seu e-mail' type='text' />
                    </div>
                    <div className='input'>
                        <label>Senha</label>
                        <input value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder='Digite a sua senha' type={showPassword ? 'text' : 'password'} />
                        {showPassword ? (
                            <IonIcon onClick={() => setShowPassword(false)} icon={eye} className='eye' />
                        ) : (
                            <IonIcon onClick={() => setShowPassword(true)} icon={eyeOff} className='eye' />
                        )}    
                    </div>

                    <span onClick={() => navigate("/esqueci-minha-senha")}>Esqueci minha senha</span>
                    <button onClick={handleEntrar}>
                        {carregando ? (
                            <div className='loader'></div>
                        ) : (
                            <>Entrar</>
                        )}
                    </button>

                    <div className='or'>
                        <div></div>
                        <p>OU</p>
                        <div></div>
                    </div>

                    <button onClick={handleEntrarGoogle} className='btn-google'>
                        {carregando ? (
                            <div className='loader'></div>
                        ) : (
                            <>
                                <FcGoogle className='icon' />
                                Entrar com Google
                            </>
                        )}
                    </button>
                </div>
                <div className='info'>
                    <img src={Icon} />
                    <h1>Tem uma concessionária <br /> e não está no DriveX?</h1>
                    <button onClick={() => navigate("/cadastrar")}>
                        Cadastre-se
                    </button>
                </div>
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