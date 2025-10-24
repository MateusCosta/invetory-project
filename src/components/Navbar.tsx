import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavbarComponent: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3 mb-md-4">
            <Container fluid>
                <Navbar.Brand href="/" className="fw-bold">
                    <span className="d-none d-sm-inline">Sistema de Inventário</span>
                    <span className="d-inline d-sm-none">Inventário</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/" className="text-center text-md-start">Painel</Nav.Link>
                        <Nav.Link href="/inventory" className="text-center text-md-start">Inventário</Nav.Link>
                        <Nav.Link href="/stock-movement" className="text-center text-md-start">Movimentação</Nav.Link>
                        <Nav.Link href="/transactions" className="text-center text-md-start">Entradas e Saídas</Nav.Link>

                        {user?.role === 'admin' && (
                            <NavDropdown title="Admin" id="admin-dropdown" className="text-center text-md-start">
                                <NavDropdown.Item href="/admin/users">Gerenciar Usuários</NavDropdown.Item>
                                <NavDropdown.Item href="/admin/branches">Gerenciar Acolhimentos</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>

                    <Nav className="mt-2 mt-lg-0">
                        <NavDropdown
                            title={`Bem-vindo, ${user?.username}`}
                            id="user-dropdown"
                            align="end"
                            className="text-center text-md-start"
                        >
                            <NavDropdown.Item onClick={handleLogout}>
                                Sair
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;
