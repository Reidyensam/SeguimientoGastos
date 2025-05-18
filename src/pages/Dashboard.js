import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const categorias = [
    "Alimentación", "Transporte", "Vivienda", "Entretenimiento",
    "Salud", "Educación", "Ropa y accesorios", "Viajes", "Otros"
];

const Dashboard = () => {
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [gastos, setGastos] = useState([]);
    const [nombre, setNombre] = useState("");
    const [monto, setMonto] = useState("");
    const [categoria, setCategoria] = useState("Otros");
    const [fecha, setFecha] = useState(new Date().toISOString());
    const [editandoId, setEditandoId] = useState(null); // 🔹 Estado para manejar la edición
    const navigate = useNavigate();

    useEffect(() => {
        const cargarGastos = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:3001/api/gastos", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("📥 Datos recibidos en el frontend:", JSON.stringify(response.data, null, 2));
                setGastos(response.data);
            } catch (error) {
                console.error("❌ Error al obtener los gastos:", error.response?.data || error.message);
                alert("❌ No se pudo cargar los gastos.");
            }
        };

        cargarGastos();
    }, [navigate]);

    const handleAgregarGasto = async (e) => {
        e.preventDefault();

        console.log("🧐 Nombre antes de enviarse:", nombre);

        const token = localStorage.getItem("token");

        if (!token) {
            alert("❌ No estás autenticado.");
            navigate("/login");
            return;
        }

        if (!nombre?.trim() || isNaN(monto) || Number(monto) <= 0 || !categoria?.trim()) {
            alert("❌ Datos inválidos. Ingresa un nombre, monto y categoría válida.");
            return;
        }

        const gastoData = {
            nombre: nombre.trim(),
            monto: parseFloat(monto),
            fecha,
            categoria: categoria.trim(),
            completado: false // 🔹 Inicialmente, el gasto no está completado
        };

        console.log("📤 Datos enviados al backend:", JSON.stringify(gastoData, null, 2));

        try {
            const response = await axios.post("http://localhost:3001/api/gastos", 
                gastoData, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ Respuesta del backend:", JSON.stringify(response.data, null, 2));

            setGastos((prevGastos) => [...prevGastos, response.data]);
            setNombre("");
            setMonto("");
            setCategoria("Otros"); 
            setFecha(new Date().toISOString());
        } catch (error) {
            console.error("❌ Error al agregar gasto:", error.response?.data || error.message);
            alert("❌ No se pudo agregar el gasto.");
        }
    };

    const handleCompletarGasto = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(`http://localhost:3001/api/gastos/${id}`, { completado: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setGastos((prevGastos) =>
                prevGastos.map((gasto) =>
                    gasto.id === id ? { ...gasto, completado: true } : gasto
                )
            );
        } catch (error) {
            console.error("❌ Error al completar el gasto:", error.response?.data || error.message);
        }
    };

    const handleEliminarGasto = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(`http://localhost:3001/api/gastos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setGastos((prevGastos) => prevGastos.filter((gasto) => gasto.id !== id));
            console.log(`🗑 Gasto eliminado: ${id}`);
        } catch (error) {
            console.error("❌ Error al eliminar el gasto:", error.response?.data || error.message);
        }
    };

    const handleEditarGasto = (id) => {
        setEditandoId(id);
    };

    const handleGuardarEdicion = async (id, nuevoNombre, nuevoMonto, nuevaCategoria) => {
        try {
            const token = localStorage.getItem("token");

            const updatedGasto = {
                nombre: nuevoNombre.trim(),
                monto: parseFloat(nuevoMonto),
                categoria: nuevaCategoria.trim()
            };

            await axios.put(`http://localhost:3001/api/gastos/${id}`, updatedGasto, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setGastos((prevGastos) =>
                prevGastos.map((gasto) =>
                    gasto.id === id ? { ...gasto, ...updatedGasto } : gasto
                )
            );

            setEditandoId(null);
        } catch (error) {
            console.error("❌ Error al editar el gasto:", error.response?.data || error.message);
        }
    };
const gastosFiltrados = gastos.filter((gasto) => {
    return filtroCategoria ? gasto.categoria === filtroCategoria : true;
});
    return (
        <Container>
            <Header>



                <Title>Panel de Gastos</Title>
                <LogoutButton onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}>Cerrar Sesión</LogoutButton>
            </Header>

            <Form>
    <SearchContainer>
        <SearchTitle>Buscar</SearchTitle>
        <Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </Select>
    </SearchContainer>
    
    <Input type="text" placeholder="Nombre del gasto" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
    <Input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} required />
    <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
        {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
        ))}
    </Select>
    <Button type="submit">Agregar Gasto</Button>
</Form>

            <GastoList>
    {gastosFiltrados
        .sort((a, b) => Number(a.completado) - Number(b.completado)) // 🔹 Mueve los completados al final
        .map((gasto) => (
            <GastoCard key={gasto.id} completado={gasto.completado}>
                {editandoId === gasto.id ? (
                    <>
                        <Input 
                            type="text" 
                            defaultValue={gasto.nombre} 
                            onChange={(e) => setGastos(prevGastos =>
                                prevGastos.map(g =>
                                    g.id === gasto.id ? { ...g, nombre: e.target.value } : g
                                )
                            )}
                        />
                        <Input 
                            type="number" 
                            defaultValue={gasto.monto} 
                            onChange={(e) => setGastos(prevGastos =>
                                prevGastos.map(g =>
                                    g.id === gasto.id ? { ...g, monto: e.target.value } : g
                                )
                            )}
                        />
                        <Select 
                            defaultValue={gasto.categoria} 
                            onChange={(e) => setGastos(prevGastos =>
                                prevGastos.map(g =>
                                    g.id === gasto.id ? { ...g, categoria: e.target.value } : g
                                )
                            )}
                        >
                            {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                        <Button onClick={() => handleGuardarEdicion(gasto.id, gasto.nombre, gasto.monto, gasto.categoria)}>Guardar</Button>
                    </>
                ) : (
                    <>
                        <h3>{gasto.nombre}</h3>
                        <p>Monto: Bs. {gasto.monto}</p>
                        <p>Categoría: {gasto.categoria}</p>
                        <p>Fecha: {new Date(gasto.fecha).toLocaleDateString()}</p>

                        {!gasto.completado && (
                            <ButtonContainer>
                                <Button onClick={() => handleEditarGasto(gasto.id)}>Editar</Button>
                                <Button onClick={() => handleCompletarGasto(gasto.id)}>Completar</Button>
                            </ButtonContainer>
                        )}
                        {gasto.completado && (
                            <DeleteButton onClick={() => handleEliminarGasto(gasto.id)}>Eliminar</DeleteButton>
                        )}
                    </>
                )}
            </GastoCard>
        ))}
</GastoList>
        </Container>
    );
};

export default Dashboard;

// 🔹 Estilos con `styled-components`
const SearchContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 20px;
`;

const SearchTitle = styled.p`
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 5px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const GastoCard = styled.div`
    background-color: ${(props) => (props.completado ? "#2ecc71" : "#174753")}; 
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    
    &:hover {
        transform: scale(1.05);
    }
`;


const DeleteButton = styled.button`
    background-color: #c0392b;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #a93226;
    }
`;

// 🔹 Estilos con `styled-components`
const Container = styled.div`
    padding: 20px;
    background-color: #081c24;
    color: white;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h1`
    text-align: center;
    margin-bottom: 20px;
`;

const LogoutButton = styled.button`
    background-color: #c0392b;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #a93226;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
`;

const Input = styled.input`
    padding: 10px;
    border-radius: 5px;
    border: none;
    font-size: 1rem;
`;

const Select = styled.select`
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
    margin-right: 10px; /* 🔹 Espacio entre botones */

    &:hover {
        background-color: #12876f;
    }
`;

const GastoList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
`;

const EmptyMessage = styled.p`
    text-align: center;
    font-size: 1.2rem;
    margin-top: 20px;
    color: lightgray;
`;