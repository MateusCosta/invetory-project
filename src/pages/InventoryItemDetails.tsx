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
    Badge
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { MockApiService } from '../services/mockApi';
import type { InventoryItem, WithdrawalData } from '../types';

const InventoryItemDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalData, setWithdrawalData] = useState({
        quantity: 0,
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const items = await MockApiService.getInventoryItems();
            const foundItem = items.find(item => item.id === id);

            if (!foundItem) {
                setError('Item não encontrado');
                return;
            }

            setItem(foundItem);
        } catch (err) {
            setError('Falha ao carregar detalhes do item');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !id) return;

        try {
            const withdrawal: WithdrawalData = {
                itemId: id,
                quantity: withdrawalData.quantity,
                date: withdrawalData.date
            };

            await MockApiService.recordWithdrawal(withdrawal);
            await fetchItem();
            setShowWithdrawalModal(false);
            setWithdrawalData({
                quantity: 0,
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            setError('Falha ao registrar retirada');
            console.error('Error:', err);
        }
    };

    const getStockBadgeVariant = (currentStock: number) => {
        if (currentStock < 5) return 'danger';
        if (currentStock < 10) return 'warning';
        return 'success';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
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

    if (error || !item) {
        return (
            <Container>
                <Alert variant="danger">{error || 'Item não encontrado'}</Alert>
                <Button variant="secondary" onClick={() => navigate('/inventory')}>
                    Voltar ao Inventário
                </Button>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>{item.name}</h2>
                            <p className="text-muted mb-0">
                                <Badge bg="secondary" className="me-2">{item.category}</Badge>
                                <Badge bg={getStockBadgeVariant(item.currentStock)}>
                                    Estoque Atual: {item.currentStock} {item.unit}
                                </Badge>
                            </p>
                        </div>
                        <Button variant="outline-secondary" onClick={() => navigate('/inventory')}>
                            Voltar ao Inventário
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4 g-3">
                <Col xs={12} lg={6}>
                    <Card className="h-100">
                        <Card.Header>
                            <h5 className="mb-0">Informações do Item</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table borderless size="sm">
                                <tbody>
                                    <tr>
                                        <td><strong>Nome:</strong></td>
                                        <td>{item.name}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Categoria:</strong></td>
                                        <td>{item.category}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estoque Atual:</strong></td>
                                        <td>
                                            <Badge bg={getStockBadgeVariant(item.currentStock)}>
                                                {item.currentStock} {item.unit}
                                            </Badge>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Estoque Inicial:</strong></td>
                                        <td>{item.stock} {item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Novas Chegadas:</strong></td>
                                        <td>{item.arrived} {item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Total Após Chegada:</strong></td>
                                        <td>{item.stock + item.arrived} {item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Unidade:</strong></td>
                                        <td>{item.unit}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Criado:</strong></td>
                                        <td>{formatDate(item.createdAt)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Última Atualização:</strong></td>
                                        <td>{formatDate(item.updatedAt)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card className="h-100">
                        <Card.Header className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                            <h5 className="mb-2 mb-sm-0">Retiradas Diárias</h5>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowWithdrawalModal(true)}
                                className="w-100 w-sm-auto"
                            >
                                Registrar Retirada
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {item.dailyWithdrawals.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Quantidade</th>
                                                <th>Restante</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.dailyWithdrawals
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((withdrawal, index) => {
                                                    const remaining = item.stock + item.arrived -
                                                        item.dailyWithdrawals
                                                            .filter(w => new Date(w.date) <= new Date(withdrawal.date))
                                                            .reduce((sum, w) => sum + w.quantity, 0);

                                                    return (
                                                        <tr key={index}>
                                                            <td>{formatDate(withdrawal.date)}</td>
                                                            <td>{withdrawal.quantity} {item.unit}</td>
                                                            <td>
                                                                <Badge bg={getStockBadgeVariant(remaining)}>
                                                                    {remaining} {item.unit}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-muted text-center py-3">Nenhuma retirada registrada ainda</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showWithdrawalModal} onHide={() => setShowWithdrawalModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Retirada</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleWithdrawal}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Data da Retirada</Form.Label>
                            <Form.Control
                                type="date"
                                value={withdrawalData.date}
                                onChange={(e) => setWithdrawalData({ ...withdrawalData, date: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quantidade</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max={item.currentStock}
                                value={withdrawalData.quantity}
                                onChange={(e) => setWithdrawalData({ ...withdrawalData, quantity: parseInt(e.target.value) || 0 })}
                                required
                                placeholder={`Máx: ${item.currentStock} ${item.unit}`}
                            />
                            <Form.Text className="text-muted">
                                Disponível: {item.currentStock} {item.unit}
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowWithdrawalModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Registrar Retirada
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default InventoryItemDetails;
