import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { LegalEntitiesPage } from './pages/LegalEntitiesPage';
import { BusinessUnitsPage } from './pages/BusinessUnitsPage';
import { DivisionsPage } from './pages/DivisionsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { CostCentersPage } from './pages/CostCentersPage';
import { CargosPage } from './pages/CargosPage';
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
            <Route
              path="/legal-entities"
              element={
                <RequireRole roles={['ADMIN']}>
                  <LegalEntitiesPage />
                </RequireRole>
              }
            />
            <Route
              path="/business-units"
              element={
                <RequireRole roles={['ADMIN']}>
                  <BusinessUnitsPage />
                </RequireRole>
              }
            />
            <Route
              path="/divisions"
              element={
                <RequireRole roles={['ADMIN']}>
                  <DivisionsPage />
                </RequireRole>
              }
            />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route
              path="/cost-centers"
              element={
                <RequireRole roles={['ADMIN']}>
                  <CostCentersPage />
                </RequireRole>
              }
            />
            <Route
              path="/cargos"
              element={
                <RequireRole roles={['ADMIN']}>
                  <CargosPage />
                </RequireRole>
              }
            />
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
