import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Badge,
    Spinner
} from 'react-bootstrap';
import { MockApiService } from '../services/mockApi';
import type { User, Branch, CreateUserData } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserData>({
        username: '',
        password: '',
        role: 'user',
        branchId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, branchesData] = await Promise.all([
                MockApiService.getUsers(),
                MockApiService.getBranches()
            ]);
            setUsers(usersData);
            setBranches(branchesData);
        } catch (err) {
            setError('Falha ao carregar dados');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await MockApiService.updateUser(editingUser.id, formData);
            } else {
                await MockApiService.createUser(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (err) {
            setError('Falha ao salvar usuário');
            console.error('Error:', err);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            role: user.role,
            branchId: user.branchId || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                await MockApiService.deleteUser(id);
                await fetchData();
            } catch (err) {
                setError('Falha ao excluir usuário');
                console.error('Error:', err);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            role: 'user',
            branchId: ''
        });
    };

    const getBranchName = (branchId?: string) => {
        if (!branchId) return 'No branch assigned';
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : 'Unknown branch';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Gerenciamento de Usuários</h2>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Adicionar Novo Usuário
                        </Button>
                    </div>
                </Col>
            </Row>

            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}

            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Table responsive striped hover className="table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-nowrap">Usuário</th>
                                        <th className="text-nowrap">Função</th>
                                        <th className="text-nowrap">Acolhimento</th>
                                        <th className="text-nowrap">Criado</th>
                                        <th className="text-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>
                                                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td>{getBranchName(user.branchId)}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(user)}
                                                        className="me-1 mb-1"
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id)}
                                                        className="mb-1"
                                                    >
                                                        Excluir
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Usuário</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Senha</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                        placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Função</Form.Label>
                                    <Form.Select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="admin">Administrador</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Acolhimento</Form.Label>
                                    <Form.Select
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    >
                                        <option value="">Selecione um acolhimento</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingUser ? 'Atualizar Usuário' : 'Criar Usuário'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default UserManagement;
