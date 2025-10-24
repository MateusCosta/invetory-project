import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { MockApiService } from '../services/mockApi';
import { Link } from 'react-router-dom';
import type { InventoryItem, StockMovement, User, Branch } from '../types';

interface DashboardData {
    totalBranches: number;
    totalUsers: number;
    totalItems: number;
    lowStockItems: InventoryItem[];
    recentMovements: StockMovement[];
    recentItems: InventoryItem[];
    recentUsers: User[];
    recentBranches: Branch[];
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const dashboardData = await MockApiService.getDashboardData(
                    user?.role || 'user',
                    user?.branchId
                );

                // Buscar dados recentes
                const [movements, items, users, branches] = await Promise.all([
                    MockApiService.getStockMovements(),
                    MockApiService.getInventoryItems(),
                    MockApiService.getUsers(),
                    MockApiService.getBranches()
                ]);

                // Filtrar dados baseado no usuário
                let filteredMovements = movements;
                let filteredItems = items;

                if (user?.role === 'user' && user.branchId) {
                    filteredMovements = movements.filter(m => {
                        const item = items.find(i => i.id === m.itemId);
                        return item?.branchId === user.branchId;
                    });
                    filteredItems = items.filter(item => item.branchId === user.branchId);
                }

                // Ordenar por data de criação (mais recentes primeiro)
                const recentMovements = filteredMovements
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                const recentItems = filteredItems
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                const recentUsers = users
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                const recentBranches = branches
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                setData({
                    ...dashboardData,
                    recentMovements,
                    recentItems,
                    recentUsers,
                    recentBranches
                });
            } catch (err) {
                setError('Falha ao carregar dados do painel');
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Funções auxiliares
    const getItemName = (itemId: string) => {
        const item = data?.recentItems.find(i => i.id === itemId) ||
            data?.lowStockItems.find(i => i.id === itemId);
        return item ? item.name : 'Item não encontrado';
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

    const getMovementIcon = (type: 'entrada' | 'saida') => {
        return type === 'entrada' ? 'bi-arrow-up-circle-fill text-success' : 'bi-arrow-down-circle-fill text-danger';
    };

    const getMovementBadge = (type: 'entrada' | 'saida') => {
        return type === 'entrada' ? 'success' : 'danger';
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

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!data) {
        return <Alert variant="warning">Nenhum dado disponível</Alert>;
    }

    return (
        <div>
            <h2 className="mb-4">
                Painel de Controle
                {user?.role === 'user' && (
                    <small className="text-muted ms-2">- Seu Acolhimento</small>
                )}
            </h2>

            {/* Cards de Resumo */}
            <Row className="mb-4 g-3">
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-primary mb-2">{data.totalBranches}</Card.Title>
                            <Card.Text className="mb-0">Total de Acolhimentos</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-success mb-2">{data.totalUsers}</Card.Title>
                            <Card.Text className="mb-0">Total de Usuários</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-info mb-2">{data.totalItems}</Card.Title>
                            <Card.Text className="mb-0">Total de Itens</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title className="text-warning mb-2">{data.lowStockItems.length}</Card.Title>
                            <Card.Text className="mb-0">Itens com Estoque Baixo</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Cards de Atividade Recente */}
            <Row className="g-3">
                {/* Últimas Movimentações */}
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <i className="bi bi-arrow-left-right me-2"></i>
                                Últimas Movimentações
                            </h6>
                            <Link to="/transactions" className="btn btn-sm btn-outline-primary">
                                Ver Todas
                            </Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {data.recentMovements.length > 0 ? (
                                    data.recentMovements.map((movement) => (
                                        <ListGroup.Item key={movement.id} className="d-flex align-items-center">
                                            <i className={`bi ${getMovementIcon(movement.type)} me-2`}></i>
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{getItemName(movement.itemId)}</div>
                                                <small className="text-muted">
                                                    {movement.quantity} unidades • {formatDate(movement.date)}
                                                </small>
                                            </div>
                                            <Badge bg={getMovementBadge(movement.type)}>
                                                {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                                            </Badge>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-center text-muted">
                                        Nenhuma movimentação recente
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Últimos Itens Cadastrados */}
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <i className="bi bi-box me-2"></i>
                                Últimos Itens
                            </h6>
                            <Link to="/inventory" className="btn btn-sm btn-outline-primary">
                                Ver Todos
                            </Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {data.recentItems.length > 0 ? (
                                    data.recentItems.map((item) => (
                                        <ListGroup.Item key={item.id} className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{item.name}</div>
                                                <small className="text-muted">
                                                    {item.currentStock} {item.unit} • {item.category}
                                                </small>
                                            </div>
                                            <Badge bg="secondary">{item.category}</Badge>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-center text-muted">
                                        Nenhum item cadastrado recentemente
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Últimos Usuários Adicionados */}
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <i className="bi bi-people me-2"></i>
                                Últimos Usuários
                            </h6>
                            {user?.role === 'admin' && (
                                <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                                    Ver Todos
                                </Link>
                            )}
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {data.recentUsers.length > 0 ? (
                                    data.recentUsers.map((userItem) => (
                                        <ListGroup.Item key={userItem.id} className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{userItem.username}</div>
                                                <small className="text-muted">
                                                    {userItem.role === 'admin' ? 'Administrador' : 'Usuário'} • {formatDate(userItem.createdAt)}
                                                </small>
                                            </div>
                                            <Badge bg={userItem.role === 'admin' ? 'danger' : 'primary'}>
                                                {userItem.role === 'admin' ? 'Admin' : 'User'}
                                            </Badge>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-center text-muted">
                                        Nenhum usuário adicionado recentemente
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Últimas Filiais Cadastradas */}
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">
                                <i className="bi bi-building me-2"></i>
                                Últimos Acolhimentos
                            </h6>
                            {user?.role === 'admin' && (
                                <Link to="/admin/branches" className="btn btn-sm btn-outline-primary">
                                    Ver Todos
                                </Link>
                            )}
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {data.recentBranches.length > 0 ? (
                                    data.recentBranches.map((branch) => (
                                        <ListGroup.Item key={branch.id} className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">{branch.name}</div>
                                                <small className="text-muted">
                                                    {branch.location} • {formatDate(branch.createdAt)}
                                                </small>
                                            </div>
                                            <Badge bg="info">Acolhimento</Badge>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-center text-muted">
                                        Nenhum acolhimento cadastrado recentemente
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {data.lowStockItems.length > 0 && (
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">⚠️ Alerta de Estoque Baixo</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-nowrap">Nome do Item</th>
                                                <th className="text-nowrap">Categoria</th>
                                                <th className="text-nowrap">Estoque Atual</th>
                                                <th className="text-nowrap">Unidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.lowStockItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="text-truncate" style={{ maxWidth: '200px' }} title={item.name}>
                                                        {item.name}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{item.category}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${item.currentStock < 5 ? 'bg-danger' : 'bg-warning'}`}>
                                                            {item.currentStock}
                                                        </span>
                                                    </td>
                                                    <td className="text-nowrap">{item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {data.lowStockItems.length === 0 && (
                <Row>
                    <Col>
                        <Card>
                            <Card.Body className="text-center">
                                <h5 className="text-success">✅ Todos os itens estão bem estocados!</h5>
                                <p className="text-muted">Nenhum alerta de estoque baixo no momento.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default Dashboard;
