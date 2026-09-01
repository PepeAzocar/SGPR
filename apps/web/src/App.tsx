import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { PositionsPage } from './pages/PositionsPage';
import { ContractsPage } from './pages/ContractsPage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPeriodsPage } from './pages/PayrollPeriodsPage';
import { PayrollPeriodDetailPage } from './pages/PayrollPeriodDetailPage';
import { CatalogsPage } from './pages/CatalogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/payroll-periods" element={<PayrollPeriodsPage />} />
            <Route path="/payroll-periods/:id" element={<PayrollPeriodDetailPage />} />
            <Route path="/catalogs" element={<CatalogsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
