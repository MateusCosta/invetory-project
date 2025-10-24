export interface User {
    id: string;
    username: string;
    password: string;
    role: 'admin' | 'user';
    branchId?: string;
    createdAt: string;
}

export interface Branch {
    id: string;
    name: string;
    location: string;
    createdAt: string;
}

export interface DailyWithdrawal {
    date: string;
    quantity: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    arrived: number;
    currentStock: number;
    unit: string;
    branchId: string;
    dailyWithdrawals: DailyWithdrawal[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface CreateUserData {
    username: string;
    password: string;
    role: 'admin' | 'user';
    branchId?: string;
}

export interface CreateBranchData {
    name: string;
    location: string;
}

export interface CreateInventoryItemData {
    name: string;
    category: string;
    stock: number;
    arrived: number;
    unit: string;
    branchId: string;
}

export interface UpdateInventoryItemData {
    name?: string;
    category?: string;
    stock?: number;
    arrived?: number;
    unit?: string;
}

export interface WithdrawalData {
    itemId: string;
    quantity: number;
    date: string;
}

export interface StockMovement {
    id: string;
    itemId: string;
    type: 'entrada' | 'saida';
    quantity: number;
    reason: string;
    date: string;
    userId: string;
    createdAt: string;
}

export interface CreateStockMovementData {
    itemId: string;
    type: 'entrada' | 'saida';
    quantity: number;
    reason: string;
    description?: string;
    date: string;
}

export const MOVEMENT_REASONS = {
    // Motivos para Entrada
    ENTRADA: {
        COMPRA: 'Compra',
        DOACAO: 'Doação',
        TRANSFERENCIA: 'Transferência',
        REPOSICAO: 'Reposição',
        OUTROS: 'Outros'
    },
    // Motivos para Saída
    SAIDA: {
        CONSUMO: 'Consumo',
        AVARIADO: 'Avariado',
        TRANSFERENCIA: 'Transferência',
        VENCIDO: 'Vencido',
        OUTROS: 'Outros'
    }
} as const;

export const INVENTORY_CATEGORIES = {
    MERCEARIA: 'Mercearia',
    LIMPEZA: 'Limpeza',
    DESCARTAVEIS: 'Descartáveis',
    HIGIENE_PESSOAL: 'Higiene Pessoal',
    FRIOS: 'Frios',
    PROTEINAS: 'Proteínas',
    HORTIFRUTI: 'Hortifrúti'
} as const;

export type InventoryCategory = typeof INVENTORY_CATEGORIES[keyof typeof INVENTORY_CATEGORIES];
