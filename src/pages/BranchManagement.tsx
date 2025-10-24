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
    Spinner
} from 'react-bootstrap';
import { MockApiService } from '../services/mockApi';
import type { Branch, CreateBranchData } from '../types';

const BranchManagement: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [formData, setFormData] = useState<CreateBranchData>({
        name: '',
        location: ''
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const branchesData = await MockApiService.getBranches();
            setBranches(branchesData);
        } catch (err) {
            setError('Falha ao carregar acolhimentos');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await MockApiService.updateBranch(editingBranch.id, formData);
            } else {
                await MockApiService.createBranch(formData);
            }
            await fetchBranches();
            handleCloseModal();
        } catch (err) {
            setError('Falha ao salvar acolhimento');
            console.error('Error:', err);
        }
    };

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            location: branch.location
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este acolhimento?')) {
            try {
                await MockApiService.deleteBranch(id);
                await fetchBranches();
            } catch (err) {
                setError('Falha ao excluir acolhimento');
                console.error('Error:', err);
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBranch(null);
        setFormData({
            name: '',
            location: ''
        });
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
                        <h2>Gerenciamento de Acolhimentos</h2>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Adicionar Novo Acolhimento
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
                                        <th className="text-nowrap">Nome</th>
                                        <th className="text-nowrap">Localização</th>
                                        <th className="text-nowrap">Criado</th>
                                        <th className="text-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branches.map((branch) => (
                                        <tr key={branch.id}>
                                            <td>{branch.name}</td>
                                            <td>{branch.location}</td>
                                            <td>{new Date(branch.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(branch)}
                                                        className="me-1 mb-1"
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(branch.id)}
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingBranch ? 'Editar Acolhimento' : 'Adicionar Novo Acolhimento'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome do Acolhimento</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Digite o nome do acolhimento"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Localização</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                                placeholder="Digite a localização do acolhimento"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingBranch ? 'Atualizar Acolhimento' : 'Criar Acolhimento'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default BranchManagement;
