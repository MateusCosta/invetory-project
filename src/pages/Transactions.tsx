import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { MockApiService } from '../services/mockApi';
import type { StockMovement, Branch, InventoryItem } from '../types';

const Transactions: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<StockMovement[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'entrada' | 'saida'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();

    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [selectedBranch]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [branchesData, itemsData] = await Promise.all([
                MockApiService.getBranches(),
                MockApiService.getInventoryItems()
            ]);

            setBranches(branchesData);
            setItems(itemsData);

            if (user?.role === 'user' && user.branchId) {
                setSelectedBranch(user.branchId);
            }

            // Carregar transações iniciais
            await fetchTransactions();
        } catch (err) {
            setError('Falha ao carregar dados');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            let transactionsData: StockMovement[] = [];

            if (selectedBranch) {
                transactionsData = await MockApiService.getStockMovementsByBranch(selectedBranch);
            } else {
                transactionsData = await MockApiService.getStockMovements();
            }


            // Debug: verificar se as movimentações foram carregadas
            console.log('=== TRANSACTIONS LOADED DEBUG ===');
            console.log('Transactions loaded:', transactionsData.length);
            console.log('All transactions:', transactionsData);

            setTransactions(transactionsData);
        } catch (err) {
            setError('Falha ao carregar transações');
            console.error('Error:', err);
        }
    };

    const getItemName = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        return item ? item.name : 'Item não encontrado';
    };

    const getBranchName = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return 'Item não encontrado';

        const branch = branches.find(b => b.id === item.branchId);
        return branch ? branch.name : 'Acolhimento não encontrado';
    };

    const getFilteredTransactions = () => {
        let filtered = transactions;

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(t => t.type === selectedType);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(t => {
                const itemName = getItemName(t.itemId).toLowerCase();
                const reason = t.reason.toLowerCase();
                return itemName.includes(term) || reason.includes(term);
            });
        }
        return filtered;
    };

    const getTransactionIcon = (type: 'entrada' | 'saida') => {
        if (type === 'entrada') {
            return (
                <span className="text-success fs-4">
                    <i className="bi bi-arrow-up-circle-fill"></i>
                </span>
            );
        } else {
            return (
                <span className="text-danger fs-4">
                    <i className="bi bi-arrow-down-circle-fill"></i>
                </span>
            );
        }
    };

    const getTransactionBadge = (type: 'entrada' | 'saida') => {
        if (type === 'entrada') {
            return <Badge bg="success">Entrada</Badge>;
        } else {
            return <Badge bg="danger">Saída</Badge>;
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTotalByType = (type: 'entrada' | 'saida') => {
        const filtered = getFilteredTransactions()
            .filter(t => t.type === type);

        const total = filtered.reduce((sum, t) => sum + t.quantity, 0);


        return total;
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

    const filteredTransactions = getFilteredTransactions();
    const totalEntradas = getTotalByType('entrada');
    const totalSaidas = getTotalByType('saida');

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h2>Lista de Entradas e Saídas</h2>
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

            {/* Summary Cards */}
            <Row className="mb-4 g-3">
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-success mb-2">
                                <i className="bi bi-arrow-up-circle-fill me-2"></i>
                                {totalEntradas}
                            </Card.Title>
                            <Card.Text className="mb-0">Total de items</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-danger mb-2">
                                <i className="bi bi-arrow-down-circle-fill me-2"></i>
                                {totalSaidas}
                            </Card.Title>
                            <Card.Text className="mb-0">Total de Itens</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-info mb-2">
                                {filteredTransactions.length}
                            </Card.Title>
                            <Card.Text className="mb-0">Total de Transações</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-warning mb-2">
                                {totalEntradas - totalSaidas}
                            </Card.Title>
                            <Card.Text className="mb-0">Saldo de Itens</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <Row className="g-3">
                                {user?.role === 'admin' && (
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Acolhimento</Form.Label>
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

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value as 'all' | 'entrada' | 'saida')}
                                        >
                                            <option value="all">Todos</option>
                                            <option value="entrada">Entradas</option>
                                            <option value="saida">Saídas</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Buscar</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Buscar por item ou motivo..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                Limpar
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Transactions List */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                Entradas e Saídas
                                {filteredTransactions.length > 0 && (
                                    <Badge bg="secondary" className="ms-2">
                                        {filteredTransactions.length}
                                    </Badge>
                                )}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {filteredTransactions.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover>
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-nowrap">Tipo</th>
                                                <th className="text-nowrap">Data</th>
                                                <th className="text-nowrap">Item</th>
                                                <th className="text-nowrap">Quantidade</th>
                                                <th className="text-nowrap">Motivo</th>
                                                <th className="text-nowrap">Acolhimento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td className="text-center">
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            {getTransactionIcon(transaction.type)}
                                                            <span className="ms-2 d-none d-md-inline">
                                                                {getTransactionBadge(transaction.type)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="text-nowrap">
                                                        {formatDate(transaction.date)}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <span className="fw-medium">{getItemName(transaction.itemId)}</span>
                                                            <small className="text-muted">
                                                                ID: {transaction.itemId}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`fw-bold ${transaction.type === 'entrada' ? 'text-success' : 'text-danger'
                                                            }`}>
                                                            {transaction.type === 'entrada' ? '+' : '-'}{transaction.quantity}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={transaction.reason}>
                                                            {transaction.reason}
                                                        </span>
                                                    </td>
                                                    <td className="text-nowrap">
                                                        {getBranchName(
                                                            items.find(i => i.id === transaction.itemId)?.branchId || ''
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-inbox display-1 text-muted"></i>
                                    <h5 className="text-muted mt-3">Nenhuma transação encontrada</h5>
                                    <p className="text-muted">
                                        {searchTerm || selectedType !== 'all'
                                            ? 'Tente ajustar os filtros de busca'
                                            : 'Registre algumas movimentações para ver as transações aqui'
                                        }
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Transactions;
