import type { User, Branch, InventoryItem } from '../types';
import { INVENTORY_CATEGORIES } from '../types';
import { StorageService } from './storage';

export const initializeSeedData = () => {
    try {
        // Check if data already exists
        const existingUsers = StorageService.getUsers();
        console.log('Existing users count:', existingUsers.length);
        if (existingUsers.length > 0) {
            console.log('Data already initialized, skipping...');
            return; // Data already initialized
        }

        console.log('Initializing seed data...');
    } catch (error) {
        console.error('Error checking existing data:', error);
        console.log('Proceeding with initialization...');
    }

    // Create sample branches
    const branches: Branch[] = [
        {
            id: 'branch-1',
            name: 'Acolhimento 1',
            location: 'Centro',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-2',
            name: 'Acolhimento 2',
            location: 'Zona Norte',
            createdAt: new Date().toISOString()
        },
        {
            id: 'branch-3',
            name: 'Acolhimento 3',
            location: 'Zona Sul',
            createdAt: new Date().toISOString()
        }
    ];

    // Create sample users
    const users: User[] = [
        {
            id: 'user-1',
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-2',
            username: 'usuario',
            password: 'usuario123',
            role: 'user',
            branchId: 'branch-1',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-3',
            username: 'gerente',
            password: 'gerente123',
            role: 'user',
            branchId: 'branch-2',
            createdAt: new Date().toISOString()
        }
    ];

    // Create sample inventory items
    const inventoryItems: InventoryItem[] = [
        // Mercearia items
        {
            id: 'item-1',
            name: 'Arroz branco (1 kg)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 50,
            arrived: 20,
            currentStock: 70,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 5 },
                { date: '2024-01-16', quantity: 3 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-2',
            name: 'Feijão carioca (kg)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 30,
            arrived: 15,
            currentStock: 45,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 2 },
                { date: '2024-01-16', quantity: 1 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-3',
            name: 'Leite UHT (1 litro)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 100,
            arrived: 50,
            currentStock: 150,
            unit: 'litros',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 10 },
                { date: '2024-01-16', quantity: 8 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-4',
            name: 'Açúcar (1 kg)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 25,
            arrived: 10,
            currentStock: 35,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Limpeza items
        {
            id: 'item-5',
            name: 'Detergente (5l)',
            category: INVENTORY_CATEGORIES.LIMPEZA,
            stock: 20,
            arrived: 5,
            currentStock: 25,
            unit: 'litros',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 2 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-6',
            name: 'Água sanitária (5l)',
            category: INVENTORY_CATEGORIES.LIMPEZA,
            stock: 15,
            arrived: 8,
            currentStock: 23,
            unit: 'litros',
            branchId: 'branch-1',
            dailyWithdrawals: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Descartáveis items
        {
            id: 'item-7',
            name: 'Copo descartável (180ml)',
            category: INVENTORY_CATEGORIES.DESCARTAVEIS,
            stock: 500,
            arrived: 200,
            currentStock: 700,
            unit: 'unidades',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 50 },
                { date: '2024-01-16', quantity: 30 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-8',
            name: 'Pratos descartáveis',
            category: INVENTORY_CATEGORIES.DESCARTAVEIS,
            stock: 200,
            arrived: 100,
            currentStock: 300,
            unit: 'unidades',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 20 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Higiene Pessoal items
        {
            id: 'item-9',
            name: 'Sabonete barra',
            category: INVENTORY_CATEGORIES.HIGIENE_PESSOAL,
            stock: 100,
            arrived: 50,
            currentStock: 150,
            unit: 'unidades',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 10 },
                { date: '2024-01-16', quantity: 5 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-10',
            name: 'Shampoo (350ml)',
            category: INVENTORY_CATEGORIES.HIGIENE_PESSOAL,
            stock: 30,
            arrived: 15,
            currentStock: 45,
            unit: 'unidades',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 2 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Frios items
        {
            id: 'item-11',
            name: 'Queijo mussarela',
            category: INVENTORY_CATEGORIES.FRIOS,
            stock: 20,
            arrived: 10,
            currentStock: 30,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 3 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-12',
            name: 'Presunto',
            category: INVENTORY_CATEGORIES.FRIOS,
            stock: 15,
            arrived: 8,
            currentStock: 23,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Proteínas items
        {
            id: 'item-13',
            name: 'Carne bovina',
            category: INVENTORY_CATEGORIES.PROTEINAS,
            stock: 50,
            arrived: 25,
            currentStock: 75,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 8 },
                { date: '2024-01-16', quantity: 5 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-14',
            name: 'Frango - peito',
            category: INVENTORY_CATEGORIES.PROTEINAS,
            stock: 30,
            arrived: 15,
            currentStock: 45,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 4 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Hortifrúti items
        {
            id: 'item-15',
            name: 'Tomate (kg)',
            category: INVENTORY_CATEGORIES.HORTIFRUTI,
            stock: 40,
            arrived: 20,
            currentStock: 60,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 5 },
                { date: '2024-01-16', quantity: 3 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-16',
            name: 'Cebola branca (kg)',
            category: INVENTORY_CATEGORIES.HORTIFRUTI,
            stock: 25,
            arrived: 12,
            currentStock: 37,
            unit: 'kg',
            branchId: 'branch-1',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 2 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },

        // Add some items to other branches
        {
            id: 'item-17',
            name: 'Arroz branco (1 kg)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 30,
            arrived: 15,
            currentStock: 45,
            unit: 'kg',
            branchId: 'branch-2',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 3 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'item-18',
            name: 'Leite UHT (1 litro)',
            category: INVENTORY_CATEGORIES.MERCEARIA,
            stock: 60,
            arrived: 30,
            currentStock: 90,
            unit: 'litros',
            branchId: 'branch-2',
            dailyWithdrawals: [
                { date: '2024-01-15', quantity: 6 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // Save all data to localStorage
    try {
        StorageService.setBranches(branches);
        StorageService.setUsers(users);
        StorageService.setInventoryItems(inventoryItems);

        // Create mock stock movements to justify item quantities
        const stockMovements = [
            // Acolhimento 1 - Mercearia
            {
                id: 'movement-1',
                itemId: 'item-1',
                type: 'entrada' as const,
                quantity: 50,
                reason: 'Compra inicial de arroz para estoque base',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-2',
                itemId: 'item-1',
                type: 'entrada' as const,
                quantity: 30,
                reason: 'Reposição de estoque - doação da comunidade',
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-3',
                itemId: 'item-2',
                type: 'entrada' as const,
                quantity: 25,
                reason: 'Compra de feijão para alimentação diária',
                date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-4',
                itemId: 'item-3',
                type: 'entrada' as const,
                quantity: 40,
                reason: 'Açúcar para preparo de refeições',
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-5',
                itemId: 'item-4',
                type: 'entrada' as const,
                quantity: 15,
                reason: 'Óleo de cozinha - doação de empresa local',
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-6',
                itemId: 'item-5',
                type: 'entrada' as const,
                quantity: 20,
                reason: 'Sal para temperos e conservação',
                date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 18 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 1 - Limpeza
            {
                id: 'movement-7',
                itemId: 'item-6',
                type: 'entrada' as const,
                quantity: 12,
                reason: 'Detergente para limpeza geral - compra mensal',
                date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 22 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-8',
                itemId: 'item-7',
                type: 'entrada' as const,
                quantity: 8,
                reason: 'Desinfetante para sanitização',
                date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-9',
                itemId: 'item-8',
                type: 'entrada' as const,
                quantity: 6,
                reason: 'Sabão em pó para lavanderia',
                date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 16 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 1 - Descartáveis
            {
                id: 'movement-10',
                itemId: 'item-9',
                type: 'entrada' as const,
                quantity: 20,
                reason: 'Papel toalha para cozinha - doação de supermercado',
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-11',
                itemId: 'item-10',
                type: 'entrada' as const,
                quantity: 15,
                reason: 'Guardanapos para refeições',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 2 - Mercearia
            {
                id: 'movement-12',
                itemId: 'item-11',
                type: 'entrada' as const,
                quantity: 35,
                reason: 'Arroz para Acolhimento 2 - compra inicial',
                date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-13',
                itemId: 'item-12',
                type: 'entrada' as const,
                quantity: 20,
                reason: 'Feijão para Acolhimento 2',
                date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-14',
                itemId: 'item-13',
                type: 'entrada' as const,
                quantity: 30,
                reason: 'Açúcar para Acolhimento 2',
                date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 19 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-15',
                itemId: 'item-14',
                type: 'entrada' as const,
                quantity: 10,
                reason: 'Óleo para Acolhimento 2 - doação',
                date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 11 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-16',
                itemId: 'item-15',
                type: 'entrada' as const,
                quantity: 15,
                reason: 'Sal para Acolhimento 2',
                date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 17 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 2 - Limpeza
            {
                id: 'movement-17',
                itemId: 'item-16',
                type: 'entrada' as const,
                quantity: 10,
                reason: 'Detergente para Acolhimento 2',
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-18',
                itemId: 'item-17',
                type: 'entrada' as const,
                quantity: 6,
                reason: 'Desinfetante para Acolhimento 2',
                date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 13 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-19',
                itemId: 'item-18',
                type: 'entrada' as const,
                quantity: 5,
                reason: 'Sabão em pó para Acolhimento 2',
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 2 - Descartáveis
            {
                id: 'movement-20',
                itemId: 'item-19',
                type: 'entrada' as const,
                quantity: 18,
                reason: 'Papel toalha para Acolhimento 2',
                date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-21',
                itemId: 'item-20',
                type: 'entrada' as const,
                quantity: 12,
                reason: 'Guardanapos para Acolhimento 2',
                date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 13 dias atrás
                userId: 'user-3',
                createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 3 - Mercearia
            {
                id: 'movement-22',
                itemId: 'item-21',
                type: 'entrada' as const,
                quantity: 40,
                reason: 'Arroz para Acolhimento 3 - estoque inicial',
                date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 26 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-23',
                itemId: 'item-22',
                type: 'entrada' as const,
                quantity: 25,
                reason: 'Feijão para Acolhimento 3',
                date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 23 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-24',
                itemId: 'item-23',
                type: 'entrada' as const,
                quantity: 35,
                reason: 'Açúcar para Acolhimento 3',
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-25',
                itemId: 'item-24',
                type: 'entrada' as const,
                quantity: 12,
                reason: 'Óleo para Acolhimento 3 - doação de ONG',
                date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-26',
                itemId: 'item-25',
                type: 'entrada' as const,
                quantity: 18,
                reason: 'Sal para Acolhimento 3',
                date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 16 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 3 - Limpeza
            {
                id: 'movement-27',
                itemId: 'item-26',
                type: 'entrada' as const,
                quantity: 8,
                reason: 'Detergente para Acolhimento 3',
                date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 19 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-28',
                itemId: 'item-27',
                type: 'entrada' as const,
                quantity: 5,
                reason: 'Desinfetante para Acolhimento 3',
                date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 11 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-29',
                itemId: 'item-28',
                type: 'entrada' as const,
                quantity: 4,
                reason: 'Sabão em pó para Acolhimento 3',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },

            // Acolhimento 3 - Descartáveis
            {
                id: 'movement-30',
                itemId: 'item-29',
                type: 'entrada' as const,
                quantity: 15,
                reason: 'Papel toalha para Acolhimento 3',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'movement-31',
                itemId: 'item-30',
                type: 'entrada' as const,
                quantity: 10,
                reason: 'Guardanapos para Acolhimento 3',
                date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 dias atrás
                userId: 'user-1',
                createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Save all data to localStorage
        try {
            StorageService.setBranches(branches);
            StorageService.setUsers(users);
            StorageService.setInventoryItems(inventoryItems);
            StorageService.setStockMovements(stockMovements);

            console.log('Seed data initialized successfully');
            console.log('Users created:', users.length);
            console.log('Branches created:', branches.length);
            console.log('Inventory items created:', inventoryItems.length);
            console.log('Stock movements created:', stockMovements.length);

        } catch (error) {
            console.error('Error saving seed data to localStorage:', error);
        }
    } catch (error) {
        console.error('Error saving seed data to localStorage:', error);
    }
};

// Debug function to test login
export const testLogin = () => {
    console.log('=== TESTING LOGIN ===');
    const users = StorageService.getUsers();
    console.log('Available users:', users);

    // Test admin login
    const adminUser = users.find(u => u.username === 'admin');
    console.log('Admin user found:', adminUser);

    // Test regular user login
    const regularUser = users.find(u => u.username === 'usuario');
    console.log('Regular user found:', regularUser);

    return { users, adminUser, regularUser };
};
