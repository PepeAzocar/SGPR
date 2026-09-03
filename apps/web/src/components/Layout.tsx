import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, type AuthUser } from '../auth/AuthContext';

interface NavLinkNode {
  type: 'link';
  to: string;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
}

interface NavGroupNode {
  type: 'group';
  label: string;
  children: NavNode[];
}

type NavNode = NavLinkNode | NavGroupNode;

function link(to: string, label: string, opts?: { end?: boolean; adminOnly?: boolean }): NavLinkNode {
  return { type: 'link', to, label, ...opts };
}

function group(label: string, children: NavNode[]): NavGroupNode {
  return { type: 'group', label, children };
}

// Menú en árbol: cada grupo puede seguir anidando más grupos u opciones.
const menuTree: NavNode[] = [
  group('Gestión de Personas', [
    link('/', 'Colaboradores', { end: true }),
    group('Estructura Organizacional', [
      link('/legal-entities', 'Entidades legales', { adminOnly: true }),
      link('/business-units', 'Unidades de negocio', { adminOnly: true }),
      link('/divisions', 'Divisiones', { adminOnly: true }),
      link('/departments', 'Departamentos'),
      link('/cargos', 'Cargos', { adminOnly: true }),
      link('/positions', 'Posiciones'),
    ]),
    link('/contracts', 'Contratos'),
    link('/movements', 'Movimientos'),
    link('/bank-accounts', 'Registro bancario'),
    link('/leaves', 'Ausencias'),
    link('/payroll-periods', 'Remuneraciones'),
    link('/aps-training-years', 'Control de Capacitación'),
    link('/aps-bienniums', 'Control bienal'),
  ]),
  group('Servicio de Nómina', [
    link('/cost-centers', 'Centros de costo', { adminOnly: true }),
    link('/earnings-imputation', 'Imputación de Haberes', { adminOnly: true }),
    link('/deductions-imputation', 'Imputación de Descuentos', { adminOnly: true }),
    link('/concept-creation', 'Creación de Conceptos', { adminOnly: true }),
    link('/calculation-process', 'Proceso de cálculo', { adminOnly: true }),
    link('/consistency-tests', 'Test de consistencias', { adminOnly: true }),
    link('/previred-file', 'Genera Archivo Previred', { adminOnly: true }),
    link('/social-credits', 'Créditos Sociales', { adminOnly: true }),
    link('/attendance-records', 'Reg. Atrasos e Inasistencia', { adminOnly: true }),
    link('/payslip-lookup', 'Consulta de Liquidación'),
  ]),
  group('Utilidades del sistema', [
    link('/catalogs', 'Catálogos'),
    link('/geo-catalogs', 'Catálogos geográficos'),
    link('/payroll-formulas', 'Define Cálculo Nómina'),
    link('/contract-documents', 'Gestión Contractual'),
    link('/aps-catalogs', 'Carrera Funcionaria APS'),
  ]),
];

function isVisible(node: NavNode, role?: AuthUser['role']): boolean {
  if (node.type === 'link') return !node.adminOnly || role === 'ADMIN';
  return node.children.some((child) => isVisible(child, role));
}

function NavTree({
  nodes,
  role,
  openGroups,
  onToggle,
}: {
  nodes: NavNode[];
  role?: AuthUser['role'];
  openGroups: Record<string, boolean>;
  onToggle: (label: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        if (!isVisible(node, role)) return null;

        if (node.type === 'link') {
          return (
            <NavLink key={node.to} to={node.to} end={node.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {node.label}
            </NavLink>
          );
        }

        const isOpen = openGroups[node.label] ?? true;
        return (
          <div className="nav-group" key={node.label}>
            <button type="button" className="nav-group-toggle" onClick={() => onToggle(node.label)} aria-expanded={isOpen}>
              <span className={`chevron ${isOpen ? 'open' : ''}`}>&#9656;</span>
              {node.label}
            </button>
            {isOpen && (
              <div className="nav-group-children">
                <NavTree nodes={node.children} role={role} openGroups={openGroups} onToggle={onToggle} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !(prev[label] ?? true) }));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">GPR</div>
        <nav>
          <NavTree nodes={menuTree} role={user?.role} openGroups={openGroups} onToggle={toggleGroup} />
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
