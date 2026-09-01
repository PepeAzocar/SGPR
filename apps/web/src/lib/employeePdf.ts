import { jsPDF } from 'jspdf';
import type { Employee } from '../api/types';

function fmtDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-CL');
}

export function downloadEmployeePdf(employee: Employee) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const marginX = 48;
  let y = 56;

  doc.setFontSize(16);
  doc.text('Ficha de Empleado', marginX, y);
  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, marginX, (y += 14));
  doc.setTextColor(0);

  const section = (title: string) => {
    y += 22;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, marginX, y);
    doc.setDrawColor(200);
    doc.line(marginX, y + 4, 564, y + 4);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', marginX + 150, y);
    y += 16;
  };

  section('Identificación');
  row('Tipo de documento', employee.documentType);
  row('Número de documento', employee.documentNumber);
  row('RUT', employee.rut ?? '-');
  row('Nombres', employee.firstName);
  row('Apellido paterno', employee.lastName);
  row('Apellido materno', employee.secondLastName ?? '-');
  row('Nombre social', employee.socialName ?? '-');

  section('Origen y contacto');
  row('País de nacimiento', employee.birthCountry ?? '-');
  row('Región de nacimiento', employee.birthRegion ?? '-');
  row('Comuna de nacimiento', employee.birthCommune ?? '-');
  row('Correo', employee.email ?? '-');
  row('Estado', employee.status);

  const currentAfp = employee.afpAffiliations?.[0];
  if (currentAfp) {
    section('AFP vigente');
    row('AFP', currentAfp.afp?.name ?? '-');
    row('Vigente desde', fmtDate(currentAfp.effectiveFrom));
    row('Cotización obligatoria', `${currentAfp.mandatoryContributionPct}%`);
    row('Comisión AFP', currentAfp.afpCommissionPct ? `${currentAfp.afpCommissionPct}%` : '-');
    row('Tipo de fondo', currentAfp.fundType ?? '-');
  }

  const currentHealth = employee.healthAffiliations?.[0];
  if (currentHealth) {
    section('Salud vigente');
    row('Institución', currentHealth.healthInstitution?.name ?? '-');
    row('Vigente desde', fmtDate(currentHealth.effectiveFrom));
    row('Plan (UF)', currentHealth.planUfValue ?? '-');
  }

  const fileName = `ficha-${employee.documentNumber.replace(/[^a-zA-Z0-9]/g, '')}.pdf`;
  doc.save(fileName);
}
