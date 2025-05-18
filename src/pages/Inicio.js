import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Inicio = () => {
    return (
        <Container>
            <Overlay />
            <Content>
                <Title>Bienvenido a Seguimiento de Gastos</Title>
                <Subtitle>Controla tus finanzas con estilo</Subtitle>
                <StyledButton to="/login">Comenzar</StyledButton>
            </Content>
        </Container>
    );
};

export default Inicio;

// Estilos con `styled-components`
const Container = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #081c24, #174753);
    overflow: hidden;
`;

const Overlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(22,160,133,0.2) 10%, transparent 60%);
`;

const Content = styled.div`
    position: relative;
    text-align: center;
    color: #fff;
`;

const Title = styled.h1`
    font-size: 3rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 10px;
`;

const Subtitle = styled.h2`
    font-size: 1.5rem;
    font-weight: lighter;
    margin-bottom: 20px;
    opacity: 0.8;
`;

const StyledButton = styled(Link)`
    background-color: #16a085;
    color: white;
    padding: 12px 30px;
    font-size: 1.2rem;
    text-decoration: none;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;

    &:hover {
        background-color: #12876f;
        transform: scale(1.1);
        box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.4);
    }
`;