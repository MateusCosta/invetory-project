import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ username, password });
            navigate(from, { replace: true });
        } catch (err) {
            setError('Usuário ou senha inválidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-3 mt-md-5">
            <Row className="justify-content-center">
                <Col xs={12} sm={10} md={8} lg={6} xl={4}>
                    <Card className="shadow">
                        <Card.Header className="text-center">
                            <h3>Sistema de Inventário</h3>
                            <p className="text-muted mb-0">Entre com sua conta</p>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usuário</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite seu usuário"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Digite sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Button>
                            </Form>

                            <div className="mt-3 text-center">
                                <small className="text-muted">
                                    Credenciais de demonstração:<br />
                                    Admin: admin / admin123<br />
                                    Usuário: usuario / usuario123
                                    Gerente: gerente / gerente123
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
