import type { User, Branch, InventoryItem, StockMovement } from '../types';

const STORAGE_KEYS = {
    USERS: 'inventory_users',
    BRANCHES: 'inventory_branches',
    INVENTORY_ITEMS: 'inventory_items',
    AUTH: 'inventory_auth',
    STOCK_MOVEMENTS: 'inventory_stock_movements'
} as const;

export class StorageService {
    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage for key ${key}:`, error);
            return null;
        }
    }

    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage for key ${key}:`, error);
        }
    }

    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage for key ${key}:`, error);
        }
    }

    static clear(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    // Users
    static getUsers(): User[] {
        const users = this.get<User[]>(STORAGE_KEYS.USERS) || [];
        console.log('StorageService.getUsers() - Found users:', users.length);
        return users;
    }

    static setUsers(users: User[]): void {
        console.log('StorageService.setUsers() - Saving users:', users.length);
        this.set(STORAGE_KEYS.USERS, users);
    }

    // Branches
    static getBranches(): Branch[] {
        return this.get<Branch[]>(STORAGE_KEYS.BRANCHES) || [];
    }

    static setBranches(branches: Branch[]): void {
        this.set(STORAGE_KEYS.BRANCHES, branches);
    }

    // Inventory Items
    static getInventoryItems(): InventoryItem[] {
        return this.get<InventoryItem[]>(STORAGE_KEYS.INVENTORY_ITEMS) || [];
    }

    static setInventoryItems(items: InventoryItem[]): void {
        this.set(STORAGE_KEYS.INVENTORY_ITEMS, items);
    }

    // Auth
    static getAuth(): { user: User | null; isAuthenticated: boolean } {
        return this.get<{ user: User | null; isAuthenticated: boolean }>(STORAGE_KEYS.AUTH) || { user: null, isAuthenticated: false };
    }

    static setAuth(auth: { user: User | null; isAuthenticated: boolean }): void {
        this.set(STORAGE_KEYS.AUTH, auth);
    }

    static clearAuth(): void {
        this.remove(STORAGE_KEYS.AUTH);
    }

    // Stock Movements
    static getStockMovements(): StockMovement[] {
        return this.get<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS) || [];
    }

    static setStockMovements(movements: StockMovement[]): void {
        this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
    }

    static addStockMovement(movement: StockMovement): void {
        const movements = this.getStockMovements();
        console.log('=== ADD STOCK MOVEMENT DEBUG ===');
        console.log('Current movements count:', movements.length);
        console.log('Adding movement:', movement);

        movements.push(movement);
        this.setStockMovements(movements);

        // Verificar se foi salvo
        const savedMovements = this.getStockMovements();
        console.log('After save - movements count:', savedMovements.length);
        console.log('Last movement after save:', savedMovements[savedMovements.length - 1]);
    }
}
