import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Pages - Auth
import Entrar from './pages/auth/Entrar';
import EntrarClient from './pages/auth/client/Entrar';
import EntrarStore from './pages/auth/store/Entrar';

import Cadastrar from './pages/auth/Cadastrar';
import CadastrarClient from './pages/auth/client/Cadastrar';
import CadastrarStore from './pages/auth/store/Cadastrar';

// Pages - App
import Home from './pages/app/Home';
import Produtos from './pages/app/products/Products';
import Stores from './pages/app/stores/Stores';

// Pages - Error
import Error404 from './pages/error/404';

import { clearCookies, deleteCookie, getCookie, setCookie } from './firebase/cookies';

// Toastify
import { notifySuccess, notifyError, NotificationContainer } from './toastifyServer';
import 'react-toastify/dist/ReactToastify.css';
import './css/customToastify.css';


const RouterApp = () => {

return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />

            {/* Entrar */}
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/entrar/cliente" element={<EntrarClient />} />
            <Route path="/entrar/empresa" element={<EntrarStore />} />
            
            {/* Cadastrar */}
            <Route path="/cadastrar" element={<Cadastrar />} />
            <Route path="/cadastrar/cliente" element={<CadastrarClient />} />
            <Route path="/cadastrar/empresa" element={<CadastrarStore />} />
            
            {/* Produtos */}
            <Route path="/produtos" element={<Produtos />} />
            
            {/* Empresas */}
            <Route path="/empresa/:id" element={<Stores />} />

            <Route path="/*" element={<Error404 />} />
        </Routes>
        <NotificationContainer />
    </Router>
);

}

export default RouterApp;