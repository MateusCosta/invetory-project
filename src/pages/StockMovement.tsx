import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Modal, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { MockApiService } from '../services/mockApi';
import type { InventoryItem, Branch, StockMovement, CreateStockMovementData, CreateInventoryItemData } from '../types';
import { INVENTORY_CATEGORIES, MOVEMENT_REASONS } from '../types';

const StockMovement: React.FC = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('movement');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const [formData, setFormData] = useState<CreateStockMovementData>({
        itemId: '',
        type: 'entrada',
        quantity: 0,
        reason: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [itemFormData, setItemFormData] = useState<CreateInventoryItemData>({
        name: '',
        category: INVENTORY_CATEGORIES.MERCEARIA,
        stock: 0,
        arrived: 0,
        unit: '',
        branchId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchesData = await MockApiService.getBranches();
            setBranches(branchesData);

            if (user?.role === 'user' && user.branchId) {
                setSelectedBranch(user.branchId);
                await fetchItemsByBranch(user.branchId);
            }
        } catch (err) {
            setError('Falha ao carregar dados');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchItemsByBranch = async (branchId: string) => {
        try {
            const itemsData = await MockApiService.getInventoryItems();
            const filteredItems = itemsData.filter(item => item.branchId === branchId);
            setItems(filteredItems);
        } catch (err) {
            setError('Falha ao carregar itens da filial');
            console.error('Error:', err);
        }
    };

    const fetchMovements = async () => {
        try {
            let movementsData: StockMovement[] = [];

            if (selectedBranch) {
                movementsData = await MockApiService.getStockMovementsByBranch(selectedBranch);
            } else {
                movementsData = await MockApiService.getStockMovements();
            }

            setMovements(movementsData);
        } catch (err) {
            setError('Falha ao carregar movimentações');
            console.error('Error:', err);
        }
    };

    useEffect(() => {
        if (selectedBranch) {
            fetchItemsByBranch(selectedBranch);
            fetchMovements();
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchMovements();
        }
    }, [activeTab]);

    const handleBranchChange = async (branchId: string) => {
        setSelectedBranch(branchId);
        setSelectedItem(null);
        setFormData({
            itemId: '',
            type: 'entrada',
            quantity: 0,
            reason: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleItemChange = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        setSelectedItem(item || null);
        setFormData(prev => ({ ...prev, itemId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validar quantidade
        const quantityError = validateQuantity(formData.quantity, formData.type);
        if (quantityError) {
            setError(quantityError);
            return;
        }

        // Validar motivo
        if (!formData.reason) {
            setError('Selecione um motivo para a movimentação');
            return;
        }

        if (formData.reason === 'Outros' && !formData.description?.trim()) {
            setError('Descreva o motivo específico quando selecionar "Outros"');
            return;
        }

        try {
            setLoading(true);
            console.log('=== CREATING MOVEMENT DEBUG ===');
            console.log('Form data:', formData);
            console.log('User ID:', user.id);

            const createdMovement = await MockApiService.createStockMovement(formData, user.id);
            console.log('Movement created successfully:', createdMovement);

            await fetchItemsByBranch(selectedBranch);
            await fetchMovements();
            handleCloseModal();
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao registrar movimentação');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            itemId: '',
            type: 'entrada',
            quantity: 0,
            reason: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setSelectedItem(null);
        setError('');
    };

    const handleCloseItemModal = () => {
        setShowItemModal(false);
        setItemFormData({
            name: '',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 0,
            arrived: 0,
            unit: '',
            branchId: selectedBranch
        });
        setError('');
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            const itemData = {
                ...itemFormData,
                branchId: selectedBranch
            };
            const newItem = await MockApiService.createInventoryItem(itemData);

            // Atualizar lista de itens
            await fetchItemsByBranch(selectedBranch);

            // Selecionar o novo item automaticamente
            setSelectedItem(newItem);
            setFormData(prev => ({ ...prev, itemId: newItem.id }));

            handleCloseItemModal();
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao criar item');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateQuantity = (quantity: number, type: 'entrada' | 'saida'): string | null => {
        if (type === 'saida' && selectedItem && quantity > selectedItem.currentStock) {
            return `Quantidade não pode ser maior que o estoque atual (${selectedItem.currentStock} ${selectedItem.unit})`;
        }
        if (quantity <= 0) {
            return 'Quantidade deve ser maior que zero';
        }
        return null;
    };

    const getAvailableReasons = (type: 'entrada' | 'saida') => {
        if (type === 'entrada') {
            return Object.values(MOVEMENT_REASONS.ENTRADA);
        } else {
            return Object.values(MOVEMENT_REASONS.SAIDA);
        }
    };

    const handleReasonChange = (reason: string) => {
        setFormData(prev => ({
            ...prev,
            reason,
            description: reason === 'Outros' ? prev.description : ''
        }));
    };

    const handleTypeChange = (type: 'entrada' | 'saida') => {
        setFormData(prev => ({
            ...prev,
            type,
            reason: '',
            description: ''
        }));
    };

    const getFilteredItems = () => {
        if (!selectedBranch) return items;
        return items.filter(item => item.branchId === selectedBranch);
    };

    const getItemName = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        return item ? item.name : 'Item não encontrado';
    };


    const getMovementTypeBadge = (type: 'entrada' | 'saida') => {
        return type === 'entrada' ? 'success' : 'danger';
    };

    const getMovementTypeText = (type: 'entrada' | 'saida') => {
        return type === 'entrada' ? 'Entrada' : 'Saída';
    };

    if (loading) {
        return (
            <Container>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h2>Movimentação de Estoque</h2>
                </Col>
            </Row>

            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k || 'movement')}
                                className="mb-3"
                            >
                                <Tab eventKey="movement" title="Nova Movimentação">
                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Card>
                                                <Card.Body>
                                                    <h6 className="mb-3">1. Selecione o Acolhimento</h6>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Acolhimento</Form.Label>
                                                        <Form.Select
                                                            value={selectedBranch}
                                                            onChange={(e) => handleBranchChange(e.target.value)}
                                                            disabled={user?.role === 'user'}
                                                        >
                                                            <option value="">Selecione um acolhimento</option>
                                                            {branches.map((branch) => (
                                                                <option key={branch.id} value={branch.id}>
                                                                    {branch.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        {user?.role === 'user' && (
                                                            <Form.Text className="text-muted">
                                                                Você está limitado ao seu acolhimento
                                                            </Form.Text>
                                                        )}
                                                    </Form.Group>

                                                    {selectedBranch && (
                                                        <>
                                                            <h6 className="mb-3">2. Selecione o Item</h6>
                                                            <Row className="mb-3">
                                                                <Col md={8}>
                                                                    <Form.Group>
                                                                        <Form.Label>Item</Form.Label>
                                                                        <Form.Select
                                                                            value={formData.itemId}
                                                                            onChange={(e) => handleItemChange(e.target.value)}
                                                                        >
                                                                            <option value="">Selecione um item</option>
                                                                            {items.map((item) => (
                                                                                <option key={item.id} value={item.id}>
                                                                                    {item.name} - {item.currentStock} {item.unit}
                                                                                </option>
                                                                            ))}
                                                                        </Form.Select>
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={4} className="d-flex align-items-end">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        onClick={() => setShowItemModal(true)}
                                                                        className="w-100"
                                                                    >
                                                                        <i className="bi bi-plus-circle me-2"></i>
                                                                        Cadastrar Item
                                                                    </Button>
                                                                </Col>
                                                            </Row>

                                                            {selectedItem && (
                                                                <div className="alert alert-info">
                                                                    <strong>Item Selecionado:</strong> {selectedItem.name}<br />
                                                                    <strong>Estoque Atual:</strong> {selectedItem.currentStock} {selectedItem.unit}<br />
                                                                    <strong>Categoria:</strong> {selectedItem.category}
                                                                </div>
                                                            )}

                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="primary"
                                                                    onClick={() => setShowModal(true)}
                                                                    disabled={!selectedItem}
                                                                >
                                                                    Registrar Movimentação
                                                                </Button>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    onClick={() => {
                                                                        setSelectedItem(null);
                                                                        setFormData(prev => ({ ...prev, itemId: '' }));
                                                                    }}
                                                                    disabled={!selectedItem}
                                                                >
                                                                    Limpar Seleção
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Tab>

                                <Tab eventKey="history" title="Histórico">
                                    <Row className="mb-3">
                                        {user?.role === 'admin' && (
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>Selecionar Acolhimento</Form.Label>
                                                    <Form.Select
                                                        value={selectedBranch}
                                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                                    >
                                                        <option value="">Todos os acolhimentos</option>
                                                        {branches.map((branch) => (
                                                            <option key={branch.id} value={branch.id}>
                                                                {branch.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        )}
                                    </Row>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {activeTab === 'history' && (
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Histórico de Movimentações</h5>
                            </Card.Header>
                            <Card.Body>
                                {movements.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table striped hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Data</th>
                                                    <th>Item</th>
                                                    <th>Tipo</th>
                                                    <th>Quantidade</th>
                                                    <th>Motivo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {movements.map((movement) => (
                                                    <tr key={movement.id}>
                                                        <td>{new Date(movement.date).toLocaleDateString()}</td>
                                                        <td>{getItemName(movement.itemId)}</td>
                                                        <td>
                                                            <span className={`badge bg-${getMovementTypeBadge(movement.type)}`}>
                                                                {getMovementTypeText(movement.type)}
                                                            </span>
                                                        </td>
                                                        <td>{movement.quantity}</td>
                                                        <td>{movement.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-muted">Nenhuma movimentação encontrada</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Movement Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Movimentação de Estoque</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Item</Form.Label>
                                    <Form.Select
                                        value={formData.itemId}
                                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione um item</option>
                                        {getFilteredItems().map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} - Estoque: {item.currentStock} {item.unit}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Movimentação</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => handleTypeChange(e.target.value as 'entrada' | 'saida')}
                                        required
                                    >
                                        <option value="entrada">Entrada</option>
                                        <option value="saida">Saída</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantidade</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        max={formData.type === 'saida' && selectedItem ? selectedItem.currentStock : undefined}
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        required
                                        placeholder="Digite a quantidade"
                                    />
                                    {formData.type === 'saida' && selectedItem && (
                                        <Form.Text className="text-muted">
                                            Máximo disponível: {selectedItem.currentStock} {selectedItem.unit}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Motivo</Form.Label>
                                    <Form.Select
                                        value={formData.reason}
                                        onChange={(e) => handleReasonChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione um motivo</option>
                                        {getAvailableReasons(formData.type).map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                {formData.reason === 'Outros' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Descrição do Motivo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required={formData.reason === 'Outros'}
                                            placeholder="Descreva o motivo específico"
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrar Movimentação'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Item Creation Modal */}
            <Modal show={showItemModal} onHide={handleCloseItemModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Cadastrar Novo Item</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateItem}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome do Item</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={itemFormData.name}
                                        onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                        required
                                        placeholder="Digite o nome do item"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select
                                        value={itemFormData.category}
                                        onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                                        required
                                    >
                                        {Object.values(INVENTORY_CATEGORIES).map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estoque Inicial</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={itemFormData.stock}
                                        onChange={(e) => setItemFormData({ ...itemFormData, stock: parseInt(e.target.value) || 0 })}
                                        required
                                        placeholder="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantidade Chegada</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={itemFormData.arrived}
                                        onChange={(e) => setItemFormData({ ...itemFormData, arrived: parseInt(e.target.value) || 0 })}
                                        required
                                        placeholder="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Unidade</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={itemFormData.unit}
                                        onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                                        required
                                        placeholder="ex: kg, litros, peças"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseItemModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Item'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default StockMovement;
