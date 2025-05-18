import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 🔹 Importar para redirigir
import axios from "axios";
import styled from "styled-components";

const Registro = () => {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // 🔹 Configurar navegación

    const handleRegistro = async (e) => {
        e.preventDefault();
        setError(""); // Limpiar errores previos

        try {
            // 🔹 Validaciones antes de enviar datos
            if (!nombre.trim() || !email.trim() || !contraseña.trim()) {
                setError("Todos los campos son obligatorios.");
                return;
            }

            // 🔹 Validación de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                setError("Email inválido.");
                return;
            }

            const response = await axios.post("http://localhost:3001/api/auth/registro", {
                nombre,
                email,
                contraseña
            });

            console.log("Respuesta del backend:", response.data);

            // 🔹 Guardar el token y redirigir al Dashboard
            localStorage.setItem("token", response.data.token);
            alert("✅ Registro exitoso! Redirigiendo a tu Dashboard...");
            navigate("/dashboard"); // 🔹 Redirigir al Dashboard tras el registro
        } catch (error) {
            console.error("Error al registrarse:", error.response?.data || error.message);
            setError(error.response?.data?.mensaje || "❌ Error desconocido.");
        }
    };

    return (
        <Container>
            <Title>Registro de Usuario</Title>
            <Form onSubmit={handleRegistro}>
                <Input 
                    type="text" 
                    placeholder="Nombre de usuario" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)} 
                />
                <Input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)} 
                />
                {error && <ErrorText>{error}</ErrorText>} {/* 🔹 Mensajes de error visibles */}
                <Button type="submit">Registrarse</Button>
            </Form>
            <LoginText>
                ¿Ya tienes una cuenta? <StyledLink onClick={() => navigate("/login")}>Inicia sesión aquí</StyledLink>
            </LoginText>
        </Container>
    );
};

export default Registro;

// 🔹 Estilos con `styled-components`
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #081c24;
    color: white;
`;

const Title = styled.h1`
    margin-bottom: 20px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Input = styled.input`
    padding: 10px;
    border-radius: 5px;
    border: none;
    font-size: 1rem;
`;

const Button = styled.button`
    background-color: #16a085;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    
    &:hover {
        background-color: #12876f;
    }
`;

const ErrorText = styled.p`
    color: red;
    font-size: 0.9rem;
`;

const LoginText = styled.p`
    margin-top: 15px;
    font-size: 1rem;
`;

const StyledLink = styled.span`
    color: #16a085;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    
    &:hover {
        color: #12876f;
        text-decoration: underline;
    }
`;