import React from 'react';
import './css/404.css';
import { useLocation } from 'react-router-dom';

export default function Error404() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <main className='container-404'>
            <section className='content-404'>
                <h1>404</h1>
                <h2>Oopps. A página que você acessou não existe.</h2>
                <p>A página que você está procurando {path} não existe ou ocorreu outro erro. Volte ao início ou escolha uma nova direção</p>
                <button onClick={() => window.location.href = "/"}>Voltar ao início</button>
                <a>&copy; Copyright 2024. Todos Direitos Reservados. Mercado Virtual LTDA</a>
            </section>
        </main>
    )
}