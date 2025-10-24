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
    Spinner,
    Tabs,
    Tab,
    Badge,
} from 'react-bootstrap';
import { MockApiService } from '../services/mockApi';
import type { InventoryItem, Branch, CreateInventoryItemData } from '../types';
import { INVENTORY_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';

const InventoryManagement: React.FC = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [activeCategory, setActiveCategory] = useState<string>(INVENTORY_CATEGORIES.MERCEARIA);
    const [formData, setFormData] = useState<CreateInventoryItemData>({
        name: '',
        category: INVENTORY_CATEGORIES.MERCEARIA,
        stock: 0,
        arrived: 0,
        unit: '',
        branchId: ''
    });

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            fetchItems();
        }
    }, [selectedBranch]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchesData = await MockApiService.getBranches();
            setBranches(branchesData);

            // Set default branch for regular users
            if (user?.role === 'user' && user.branchId) {
                setSelectedBranch(user.branchId);
            } else if (branchesData.length > 0) {
                setSelectedBranch(branchesData[0].id);
            }
        } catch (err) {
            setError('Falha ao carregar dados');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        if (!selectedBranch) return;

        try {
            const itemsData = await MockApiService.getInventoryItems(selectedBranch);
            setItems(itemsData);
        } catch (err) {
            setError('Falha ao carregar itens do inventário');
            console.error('Error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (editingItem) {
                await MockApiService.updateInventoryItem(editingItem.id, formData);
            } else {
                await MockApiService.createInventoryItem(formData);
            }
            await fetchItems();
            handleCloseModal();
        } catch (err) {
            setError('Falha ao salvar item do inventário');
            console.error('Error:', err);
        }
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            stock: item.stock,
            arrived: item.arrived,
            unit: item.unit,
            branchId: item.branchId
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            try {
                await MockApiService.deleteInventoryItem(id);
                await fetchItems();
            } catch (err) {
                setError('Falha ao excluir item');
                console.error('Error:', err);
            }
        }
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome do item é obrigatório';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Nome deve ter pelo menos 2 caracteres';
        }

        if (!formData.category) {
            errors.category = 'Categoria é obrigatória';
        }

        if (formData.stock < 0) {
            errors.stock = 'Estoque não pode ser negativo';
        }

        if (formData.arrived < 0) {
            errors.arrived = 'Quantidade chegada não pode ser negativa';
        }

        if (!formData.unit.trim()) {
            errors.unit = 'Unidade é obrigatória';
        }

        if (!formData.branchId) {
            errors.branchId = 'Acolhimento é obrigatório';
        }

        // Check for duplicate names in the same branch
        const existingItem = items.find(item =>
            item.name.toLowerCase() === formData.name.toLowerCase() &&
            item.branchId === formData.branchId &&
            (!editingItem || item.id !== editingItem.id)
        );

        if (existingItem) {
            errors.name = 'Já existe um item com este nome neste acolhimento';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            name: '',
            category: activeCategory,
            stock: 0,
            arrived: 0,
            unit: '',
            branchId: selectedBranch
        });
        setError('');
        setValidationErrors({});
    };

    const getFilteredItems = () => {
        return items.filter(item => item.category === activeCategory);
    };

    const getStockBadgeVariant = (currentStock: number) => {
        if (currentStock < 5) return 'danger';
        if (currentStock < 10) return 'warning';
        return 'success';
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
                        <h2>Gerenciamento de Inventário</h2>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Adicionar Novo Item
                        </Button>
                    </div>
                </Col>
            </Row>

            {user?.role === 'admin' && (
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Selecionar Acolhimento</Form.Label>
                            <Form.Select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
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
            )}

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
                            <Tabs
                                activeKey={activeCategory}
                                onSelect={(k) => setActiveCategory(k || INVENTORY_CATEGORIES.MERCEARIA)}
                                className="mb-3"
                            >
                                {Object.values(INVENTORY_CATEGORIES).map((category) => (
                                    <Tab key={category} eventKey={category} title={category}>
                                        <div className="table-responsive">
                                            <Table striped hover>
                                                <thead>
                                                    <tr className="table-light">
                                                        <th className="text-nowrap">Nome do Item</th>
                                                        <th className="text-nowrap">Estoque Atual</th>
                                                        <th className="text-nowrap">Chegou</th>
                                                        <th className="text-nowrap">Estoque Após Chegada</th>
                                                        <th className="text-nowrap">Unidade</th>
                                                        <th className="text-nowrap">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getFilteredItems().map((item) => (
                                                        <tr key={item.id}>
                                                            <td>{item.name}</td>
                                                            <td>
                                                                <Badge bg={getStockBadgeVariant(item.currentStock)}>
                                                                    {item.currentStock}
                                                                </Badge>
                                                            </td>
                                                            <td>{item.arrived}</td>
                                                            <td>{item.stock + item.arrived}</td>
                                                            <td>{item.unit}</td>
                                                            <td>
                                                                <div className="d-flex flex-wrap gap-1">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(item)}
                                                                        className="me-1 mb-1"
                                                                    >
                                                                        Editar
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(item.id)}
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
                                            {getFilteredItems().length === 0 && (
                                                <div className="text-center py-4 text-muted">
                                                    Nenhum item encontrado nesta categoria
                                                </div>
                                            )}
                                        </div>
                                    </Tab>
                                ))}
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome do Item</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Digite o nome do item"
                                        isInvalid={!!validationErrors.name}
                                    />
                                    {validationErrors.name && (
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.name}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        isInvalid={!!validationErrors.category}
                                    >
                                        {Object.values(INVENTORY_CATEGORIES).map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {validationErrors.category && (
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.category}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estoque Atual</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                        required
                                        isInvalid={!!validationErrors.stock}
                                    />
                                    {validationErrors.stock && (
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.stock}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nova Chegada</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.arrived}
                                        onChange={(e) => setFormData({ ...formData, arrived: parseInt(e.target.value) || 0 })}
                                        required
                                        isInvalid={!!validationErrors.arrived}
                                    />
                                    {validationErrors.arrived && (
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.arrived}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Unidade</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        required
                                        placeholder="ex: kg, litros, peças"
                                        isInvalid={!!validationErrors.unit}
                                    />
                                    {validationErrors.unit && (
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.unit}
                                        </Form.Control.Feedback>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                        {user?.role === 'admin' && (
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Acolhimento</Form.Label>
                                        <Form.Select
                                            value={formData.branchId}
                                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                            required
                                            isInvalid={!!validationErrors.branchId}
                                        >
                                            <option value="">Selecione um acolhimento</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {validationErrors.branchId && (
                                            <Form.Control.Feedback type="invalid">
                                                {validationErrors.branchId}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingItem ? 'Atualizar Item' : 'Criar Item'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default InventoryManagement;
