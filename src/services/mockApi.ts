import type {
    User,
    Branch,
    InventoryItem,
    LoginCredentials,
    CreateUserData,
    CreateBranchData,
    CreateInventoryItemData,
    UpdateInventoryItemData,
    WithdrawalData,
    StockMovement,
    CreateStockMovementData
} from '../types';
import { StorageService } from './storage';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
    // Authentication
    static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        await delay();

        const users = StorageService.getUsers();
        console.log('Available users:', users.map(u => ({ username: u.username, password: u.password })));
        console.log('Login attempt:', { username: credentials.username, password: credentials.password });

        const user = users.find(u => u.username === credentials.username && u.password === credentials.password);

        if (!user) {
            console.log('User not found with these credentials');
            throw new Error('Credenciais inválidas');
        }

        console.log('Login successful for user:', user.username);
        const token = `mock-token-${user.id}-${Date.now()}`;
        StorageService.setAuth({ user, isAuthenticated: true });

        return { user, token };
    }

    static async logout(): Promise<void> {
        await delay();
        StorageService.clearAuth();
    }

    static async getCurrentUser(): Promise<User | null> {
        await delay();
        const auth = StorageService.getAuth();
        return auth.user;
    }

    // Users
    static async getUsers(): Promise<User[]> {
        await delay();
        return StorageService.getUsers();
    }

    static async createUser(userData: CreateUserData): Promise<User> {
        await delay();

        const users = StorageService.getUsers();
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...userData,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        StorageService.setUsers(users);
        return newUser;
    }

    static async updateUser(id: string, userData: Partial<CreateUserData>): Promise<User> {
        await delay();

        const users = StorageService.getUsers();
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        users[userIndex] = { ...users[userIndex], ...userData };
        StorageService.setUsers(users);
        return users[userIndex];
    }

    static async deleteUser(id: string): Promise<void> {
        await delay();

        const users = StorageService.getUsers();
        const filteredUsers = users.filter(u => u.id !== id);
        StorageService.setUsers(filteredUsers);
    }

    // Branches
    static async getBranches(): Promise<Branch[]> {
        await delay();
        return StorageService.getBranches();
    }

    static async createBranch(branchData: CreateBranchData): Promise<Branch> {
        await delay();

        const branches = StorageService.getBranches();
        const newBranch: Branch = {
            id: `branch-${Date.now()}`,
            ...branchData,
            createdAt: new Date().toISOString()
        };

        branches.push(newBranch);
        StorageService.setBranches(branches);
        return newBranch;
    }

    static async updateBranch(id: string, branchData: Partial<CreateBranchData>): Promise<Branch> {
        await delay();

        const branches = StorageService.getBranches();
        const branchIndex = branches.findIndex(b => b.id === id);

        if (branchIndex === -1) {
            throw new Error('Acolhimento não encontrado');
        }

        branches[branchIndex] = { ...branches[branchIndex], ...branchData };
        StorageService.setBranches(branches);
        return branches[branchIndex];
    }

    static async deleteBranch(id: string): Promise<void> {
        await delay();

        const branches = StorageService.getBranches();
        const filteredBranches = branches.filter(b => b.id !== id);
        StorageService.setBranches(filteredBranches);
    }

    // Inventory Items
    static async getInventoryItems(branchId?: string): Promise<InventoryItem[]> {
        await delay();

        let items = StorageService.getInventoryItems();
        if (branchId) {
            items = items.filter(item => item.branchId === branchId);
        }
        return items;
    }

    static async createInventoryItem(itemData: CreateInventoryItemData): Promise<InventoryItem> {
        await delay();

        const items = StorageService.getInventoryItems();
        const newItem: InventoryItem = {
            id: `item-${Date.now()}`,
            ...itemData,
            currentStock: itemData.stock + itemData.arrived,
            dailyWithdrawals: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        items.push(newItem);
        StorageService.setInventoryItems(items);
        return newItem;
    }

    static async updateInventoryItem(id: string, itemData: UpdateInventoryItemData): Promise<InventoryItem> {
        await delay();

        const items = StorageService.getInventoryItems();
        const itemIndex = items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            throw new Error('Item de inventário não encontrado');
        }

        const updatedItem = {
            ...items[itemIndex],
            ...itemData,
            currentStock: (itemData.stock ?? items[itemIndex].stock) + (itemData.arrived ?? items[itemIndex].arrived),
            updatedAt: new Date().toISOString()
        };

        items[itemIndex] = updatedItem;
        StorageService.setInventoryItems(items);
        return updatedItem;
    }

    static async deleteInventoryItem(id: string): Promise<void> {
        await delay();

        const items = StorageService.getInventoryItems();
        const filteredItems = items.filter(item => item.id !== id);
        StorageService.setInventoryItems(filteredItems);
    }

    static async recordWithdrawal(withdrawalData: WithdrawalData): Promise<InventoryItem> {
        await delay();

        const items = StorageService.getInventoryItems();
        const itemIndex = items.findIndex(item => item.id === withdrawalData.itemId);

        if (itemIndex === -1) {
            throw new Error('Item de inventário não encontrado');
        }

        const item = items[itemIndex];
        const withdrawal = {
            date: withdrawalData.date,
            quantity: withdrawalData.quantity
        };

        item.dailyWithdrawals.push(withdrawal);
        item.currentStock = Math.max(0, item.currentStock - withdrawalData.quantity);
        item.updatedAt = new Date().toISOString();

        items[itemIndex] = item;
        StorageService.setInventoryItems(items);
        return item;
    }

    // Dashboard data
    static async getDashboardData(userRole: 'admin' | 'user', branchId?: string): Promise<{
        totalBranches: number;
        totalUsers: number;
        totalItems: number;
        lowStockItems: InventoryItem[];
    }> {
        await delay();

        const branches = StorageService.getBranches();
        const users = StorageService.getUsers();
        let items = StorageService.getInventoryItems();

        if (userRole === 'user' && branchId) {
            items = items.filter(item => item.branchId === branchId);
        }

        const lowStockItems = items.filter(item => item.currentStock < 10); // Consider low stock if less than 10

        return {
            totalBranches: branches.length,
            totalUsers: users.length,
            totalItems: items.length,
            lowStockItems
        };
    }

    // Stock Movement methods
    static async createStockMovement(movementData: CreateStockMovementData, userId: string): Promise<StockMovement> {
        await delay();

        const items = StorageService.getInventoryItems();
        const itemIndex = items.findIndex(item => item.id === movementData.itemId);

        if (itemIndex === -1) {
            throw new Error('Item de inventário não encontrado');
        }

        const item = items[itemIndex];

        // Validate stock for saída
        if (movementData.type === 'saida' && item.currentStock < movementData.quantity) {
            throw new Error('Estoque insuficiente para esta saída');
        }

        // Create movement record
        const movement: StockMovement = {
            id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            itemId: movementData.itemId,
            type: movementData.type,
            quantity: movementData.quantity,
            reason: movementData.reason + (movementData.description ? ` - ${movementData.description}` : ''),
            date: movementData.date,
            userId,
            createdAt: new Date().toISOString()
        };

        // Update item stock
        if (movementData.type === 'entrada') {
            items[itemIndex].currentStock += movementData.quantity;
            items[itemIndex].arrived += movementData.quantity;
        } else {
            items[itemIndex].currentStock -= movementData.quantity;
        }

        items[itemIndex].updatedAt = new Date().toISOString();

        // Save changes
        StorageService.setInventoryItems(items);
        StorageService.addStockMovement(movement);

        // Debug: verificar se foi salvo
        console.log('=== MOVEMENT CREATED DEBUG ===');
        console.log('Movement created:', movement);
        const savedMovements = StorageService.getStockMovements();
        console.log('Total movements in localStorage:', savedMovements.length);
        console.log('Last movement:', savedMovements[savedMovements.length - 1]);

        return movement;
    }

    static async getStockMovements(itemId?: string): Promise<StockMovement[]> {
        await delay();

        let movements = StorageService.getStockMovements();

        if (itemId) {
            movements = movements.filter(movement => movement.itemId === itemId);
        }

        // Sort by date (newest first)
        return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    static async getStockMovementsByBranch(branchId: string): Promise<StockMovement[]> {
        await delay();

        const items = StorageService.getInventoryItems();
        const branchItems = items.filter(item => item.branchId === branchId);
        const branchItemIds = branchItems.map(item => item.id);

        const movements = StorageService.getStockMovements();
        return movements.filter(movement => branchItemIds.includes(movement.itemId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
