import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import BranchManagement from './pages/BranchManagement';
import InventoryManagement from './pages/InventoryManagement';
import InventoryItemDetails from './pages/InventoryItemDetails';
import StockMovement from './pages/StockMovement';
import Transactions from './pages/Transactions';
import { initializeSeedData, testLogin } from './services/seedData';
import './App.css';

// Expose test function globally for debugging
(window as any).testLogin = testLogin;

function App() {
  useEffect(() => {
    initializeSeedData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <div className="container-fluid mt-4">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/admin/users"
                        element={
                          <AdminRoute>
                            <UserManagement />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/branches"
                        element={
                          <AdminRoute>
                            <BranchManagement />
                          </AdminRoute>
                        }
                      />
                      <Route path="/inventory" element={<InventoryManagement />} />
                      <Route path="/inventory/:id" element={<InventoryItemDetails />} />
                      <Route path="/stock-movement" element={<StockMovement />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
