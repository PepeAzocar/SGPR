import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Colaboradores', end: true },
  { to: '/legal-entities', label: 'Entidades legales', adminOnly: true },
  { to: '/business-units', label: 'Unidades de negocio', adminOnly: true },
  { to: '/divisions', label: 'Divisiones', adminOnly: true },
  { to: '/departments', label: 'Departamentos' },
  { to: '/cost-centers', label: 'Centros de costo', adminOnly: true },
  { to: '/cargos', label: 'Cargos', adminOnly: true },
  { to: '/positions', label: 'Posiciones' },
  { to: '/contracts', label: 'Contratos' },
  { to: '/leaves', label: 'Ausencias' },
  { to: '/payroll-periods', label: 'Remuneraciones' },
  { to: '/catalogs', label: 'Catálogos' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const visibleLinks = links.filter((link) => !link.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">GPR</div>
        <nav>
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-box">
          <div>{user?.email}</div>
          <div className="role">{user?.role}</div>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
