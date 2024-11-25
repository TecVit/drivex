import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useRoutes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Pages - Auth
import Entrar from './pages/auth/Entrar';
import Cadastrar from './pages/auth/Cadastrar';

// Pages - App
import Home from './pages/app/Home';
import Profile from './pages/app/Profile';

// Pages - App - Stores
import Stores from './pages/app/stores/Stores';
import Store from './pages/app/stores/Store';

// Pages - Error
import Error404 from './pages/error/404';

import { clearCookies, deleteCookie, getCookie, setCookie } from './firebase/cookies';

// Toastify
import { notifySuccess, notifyError, notifyInfo, NotificationContainer } from './toastifyServer';
import 'react-toastify/dist/ReactToastify.css';
import './css/customToastify.css';

const RouterApp = () => {
        
    return (
        <Router>
            <NotificationContainer />
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Entrar e Cadastrar */}
                <Route path="/entrar" element={<Entrar />} />
                <Route path="/cadastrar" element={<Cadastrar />} />

                {/* Perfil */}
                <Route path="/perfil" element={<Profile />} />
                
                {/* Carros */}
                <Route path="/concessionarias" element={<Stores />} />
                
                {/* Empresas */}
                <Route path="/concessionaria/:id" element={<Store />} />

                <Route path="/*" element={<Error404 />} />
            </Routes>
        </Router>
    );

}

export default RouterApp;