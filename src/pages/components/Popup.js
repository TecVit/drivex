import React, { useEffect } from 'react';
import './css/Popup.css';
import { IoMdClose } from 'react-icons/io';
import { debounce } from 'lodash';

export default function Popup({ children, title, handleClose, handleSave, handleAdd, handleSend, handleDelete, loading }) {
    function getTopPositionRelativeToPage(element) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY; // Simplificado para navegadores modernos
    }

    const animacoes = () => {
        const elements = document.querySelectorAll('[data-animation]');
        const classAnimation = 'animationClass';
        const windowTop = window.scrollY + (window.innerHeight * 4.5) / 4;

        elements.forEach((element) => {
            const positionElemento = getTopPositionRelativeToPage(element);
            if (windowTop >= positionElemento - 100) {
                element.classList.add(classAnimation);
            }
        });
    };

    useEffect(() => {
        animacoes();
        const debouncedAnimacoes = debounce(animacoes, 200); // Usando debounce para melhorar desempenho
        window.addEventListener('scroll', debouncedAnimacoes);
        return () => {
            window.removeEventListener('scroll', debouncedAnimacoes);
        };
    }, []); // Nenhuma dependência dinâmica

    return (
        <main className="container-popup">
            <section className="content-popup">
                <div className="bar">
                    <h1>{title}</h1>
                    <IoMdClose onClick={handleClose} className="icon" />
                </div>
                <div className="popup">
                    {children}
                    <div className="btns">
                        {handleDelete && (
                            <button className="delete" onClick={handleDelete}>
                                Excluir
                            </button>
                        )}
                        {handleSave && (
                            <button className="save" onClick={handleSave}>
                                {loading ? (
                                    <div className='flex'>
                                        <div style={{ marginRight: '8px' }} className='loader'></div>
                                        Carregando..
                                    </div>
                                ) : (
                                    <> Salvar Alterações </>
                                )}
                            </button>
                        )}
                        {handleAdd && (
                            <button className="save" onClick={handleAdd}>
                                Adicionar
                            </button>
                        )}
                        {handleSend && (
                            <button className="save" onClick={handleSend}>
                                Enviar
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}