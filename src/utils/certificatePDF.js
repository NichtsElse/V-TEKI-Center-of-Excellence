import jsPDF from 'jspdf';
import { format } from 'date-fns';

/**
 * Generates and downloads a PDF certificate for a given certificate record.
 */
export async function generateCertificatePDF(cert) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297;
  const H = 210;

  // ── Background ──────────────────────────────────────────────────────────
  // Dark navy base
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, W, H, 'F');

  // Accent bar left
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, 8, H, 'F');

  // Accent bar right
  pdf.setFillColor(6, 182, 212);
  pdf.rect(W - 8, 0, 8, H, 'F');

  // Top accent strip
  pdf.setFillColor(59, 130, 246);
  pdf.rect(8, 0, W - 16, 4, 'F');

  // Bottom accent strip
  pdf.setFillColor(6, 182, 212);
  pdf.rect(8, H - 4, W - 16, 4, 'F');

  // Inner card background
  pdf.setFillColor(22, 33, 55);
  pdf.roundedRect(16, 12, W - 32, H - 24, 4, 4, 'F');

  // Decorative corner circles
  pdf.setFillColor(59, 130, 246, 0.15);
  pdf.circle(40, 35, 22, 'F');
  pdf.setFillColor(6, 182, 212, 0.1);
  pdf.circle(W - 40, H - 35, 28, 'F');

  // ── Header: Logo + Brand ────────────────────────────────────────────────
  pdf.setFillColor(59, 130, 246);
  pdf.roundedRect(22, 18, 36, 12, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('V-TEKI', 40, 26, { align: 'center' });
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CENTER OF EXCELLENCE', 40, 30, { align: 'center' });

  // Certificate label top-right
  pdf.setTextColor(100, 160, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF COMPLETION', W - 24, 24, { align: 'right' });
  pdf.setTextColor(80, 130, 200);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`No. ${cert.certificate_number}`, W - 24, 30, { align: 'right' });

  // ── Divider line ────────────────────────────────────────────────────────
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.4);
  pdf.line(22, 36, W - 22, 36);

  // ── Main Title ──────────────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', W / 2, 50, { align: 'center' });

  // ── Participant Name ────────────────────────────────────────────────────
  pdf.setTextColor(96, 165, 250);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(cert.participant_name || '', W / 2, 68, { align: 'center' });

  // Name underline
  const nameWidth = Math.min(pdf.getTextWidth(cert.participant_name || '') + 20, W - 60);
  pdf.setDrawColor(6, 182, 212);
  pdf.setLineWidth(0.8);
  pdf.line(W / 2 - nameWidth / 2, 71, W / 2 + nameWidth / 2, 71);

  // ── Body text ───────────────────────────────────────────────────────────
  pdf.setTextColor(200, 220, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('has successfully completed the training program', W / 2, 82, { align: 'center' });

  // ── Program Name ────────────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const programName = cert.program_name || '';
  // Wrap long program names
  const lines = pdf.splitTextToSize(programName, W - 80);
  pdf.text(lines, W / 2, 94, { align: 'center' });

  const afterProgram = 94 + (lines.length - 1) * 8;

  // ── Meta info row ───────────────────────────────────────────────────────
  const metaY = afterProgram + 14;
  const colW = (W - 60) / 3;
  const col1 = 30 + colW / 2;
  const col2 = W / 2;
  const col3 = W - 30 - colW / 2;

  // meta backgrounds
  [col1, col2, col3].forEach(cx => {
    pdf.setFillColor(30, 45, 75);
    pdf.roundedRect(cx - colW / 2 + 2, metaY - 7, colW - 4, 20, 2, 2, 'F');
  });

  pdf.setTextColor(96, 165, 250);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BATCH', col1, metaY - 1, { align: 'center' });
  pdf.text('COMPLETION DATE', col2, metaY - 1, { align: 'center' });
  pdf.text('ASSESSMENT SCORE', col3, metaY - 1, { align: 'center' });

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(cert.batch_name || '-', col1, metaY + 6, { align: 'center' });
  pdf.text(cert.completion_date ? format(new Date(cert.completion_date), 'dd MMMM yyyy') : '-', col2, metaY + 6, { align: 'center' });
  pdf.text(cert.score != null ? `${cert.score}%` : '-', col3, metaY + 6, { align: 'center' });

  // ── Signature section ───────────────────────────────────────────────────
  const sigY = metaY + 30;

  // Left: Trainer
  pdf.setDrawColor(60, 90, 140);
  pdf.setLineWidth(0.4);
  pdf.line(30, sigY, 100, sigY);
  pdf.setTextColor(200, 220, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(cert.trainer_name || 'Trainer', 65, sigY + 5, { align: 'center' });
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 160, 220);
  pdf.text('Lead Trainer', 65, sigY + 10, { align: 'center' });

  // Right: Director
  pdf.setDrawColor(60, 90, 140);
  pdf.line(W - 100, sigY, W - 30, sigY);
  pdf.setTextColor(200, 220, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('V-TEKI CoE', W - 65, sigY + 5, { align: 'center' });
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 160, 220);
  pdf.text('Program Director', W - 65, sigY + 10, { align: 'center' });

  // ── Verification footer ─────────────────────────────────────────────────
  pdf.setFillColor(15, 30, 60);
  pdf.rect(16, H - 20, W - 32, 10, 'F');
  pdf.setTextColor(80, 120, 180);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Verify this certificate at vteki.academy/verify | Certificate ID: ${cert.certificate_number} | Issued: ${format(new Date(), 'dd MMM yyyy')}`,
    W / 2,
    H - 14,
    { align: 'center' }
  );

  // ── Download ─────────────────────────────────────────────────────────────
  const filename = `certificate-${cert.certificate_number.replace(/\//g, '-')}.pdf`;
  pdf.save(filename);
}
