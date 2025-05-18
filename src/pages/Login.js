import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // 🔹 Verificar si el usuario ya está autenticado antes de cargar la página
    useEffect(() => {
        const verificarAutenticacion = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    await axios.get("http://localhost:3001/api/auth/perfil", { headers: { Authorization: `Bearer ${token}` } });
                    navigate("/dashboard"); // 🔹 Si el token es válido, manda al Dashboard
                } catch {
                    localStorage.removeItem("token"); // 🔹 Si el token no es válido, lo elimina
                }
            }
        };

        verificarAutenticacion();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Limpiar errores previos

        try {
            // 🔹 Validaciones antes de enviar datos
            if (!email.trim() || !password.trim()) {
                setError("Todos los campos son obligatorios.");
                return;
            }

            // 🔹 Solicitud al backend con nombre correcto de propiedad `contraseña`
            const response = await axios.post("http://localhost:3001/api/auth/login", { 
                email: email.trim(), 
                contraseña: password // 🔹 Debe coincidir con `auth.js`
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                alert("✅ Login exitoso! Redirigiendo al Dashboard...");
                navigate("/dashboard"); // 🔹 Redirigir al Dashboard tras el login
            } else {
                setError("Error al iniciar sesión. No se recibió un token.");
            }
        } catch (error) {
            console.error("Error en login:", error.response?.data || error.message);
            setError(error.response?.data?.mensaje || "❌ Error desconocido.");
        }
    };

    return (
        <Container>
            <Title>Iniciar Sesión</Title>
            <Form onSubmit={handleLogin}>
                <Input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
                {error && <ErrorText>{error}</ErrorText>} {/* 🔹 Mensajes de error visibles */}
                <Button type="submit">Ingresar</Button>
            </Form>
            <RegisterText>
                ¿No tienes una cuenta? <StyledLink to="/registro">Regístrate aquí</StyledLink>
            </RegisterText>
        </Container>
    );
};

export default Login;

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

const RegisterText = styled.p`
    margin-top: 15px;
    font-size: 1rem;
`;

const StyledLink = styled(Link)`
    color: #16a085;
    font-size: 1rem;
    text-decoration: none;
    font-weight: bold;

    &:hover {
        color: #12876f;
        text-decoration: underline;
    }
`;