import { jsPDF } from 'jspdf';
import { BlindSpotAnalysis, ContextDetails } from '../types/decision';

interface GeneratePdfOptions {
  decisionTitle: string;
  currentLeaning: string;
  preConfidence: number;
  postConfidence: number;
  primaryReasons: string;
  contextDetails: ContextDetails;
  analysis: BlindSpotAnalysis;
  investigatedIndices: number[];
  userNotes: string;
}

export function generateDecisionAuditPdf(options: GeneratePdfOptions) {
  const {
    decisionTitle,
    currentLeaning,
    preConfidence,
    postConfidence,
    primaryReasons,
    contextDetails,
    analysis,
    investigatedIndices,
    userNotes,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const margin = 45;
  const contentWidth = pageWidth - margin * 2; // ~505 pt
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 55) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Helper for printing wrapped text blocks
  const printWrapped = (
    text: string,
    fontSize = 10,
    fontColor: [number, number, number] = [40, 44, 52],
    isBold = false,
    lineSpacing = 14
  ) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(fontColor[0], fontColor[1], fontColor[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPageBreak(lineSpacing);
      doc.text(line, margin, y);
      y += lineSpacing;
    }
  };

  // 1. HEADER & BRANDING
  doc.setFillColor(18, 21, 28);
  doc.rect(margin, y, contentWidth, 54, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('APERTURE · DECISION REASONING AUDIT', margin + 14, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('EXECUTIVE COGNITIVE MIRROR & DUE DILIGENCE DOSSIER', margin + 14, y + 36);

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 145, 155);
  doc.text(`DATE: ${timestamp}`, pageWidth - margin - 95, y + 28);

  y += 70;

  // 2. DECISION CORE SUMMARY BOX
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 75, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DECISION UNDER AUDIT:', margin + 12, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(decisionTitle, contentWidth - 24);
  doc.text(titleLines[0] || decisionTitle, margin + 12, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Initial Stance: ${currentLeaning}`, margin + 12, y + 50);

  const delta = postConfidence - preConfidence;
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Confidence: ${preConfidence}%  -->  ${postConfidence}% (${delta >= 0 ? '+' : ''}${delta}%)`,
    margin + 12,
    y + 64
  );

  y += 90;

  // 3. EXECUTIVE SALIENCE MIRROR
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SALIENCE BALANCE (VISIBLE ANCHORS vs QUIET TRADEOFFS)', margin, y);
  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  printWrapped(
    analysis.executiveMirror.mentalModelSummary,
    9.5,
    [51, 65, 85],
    false,
    13
  );
  y += 6;

  checkPageBreak(50);
  doc.setFillColor(254, 243, 199); // Amber tint
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OVER-WEIGHTED VISIBLE FACTORS:', margin + 8, y + 15);
  y += 30;

  for (const factor of analysis.executiveMirror.overweightedFactors) {
    printWrapped(`• ${factor}`, 9, [71, 85, 105], false, 12);
  }
  y += 6;

  checkPageBreak(50);
  doc.setFillColor(236, 253, 245); // Emerald tint
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('UNDER-WEIGHTED QUIET REALITIES:', margin + 8, y + 15);
  y += 30;

  for (const factor of analysis.executiveMirror.underweightedFactors) {
    printWrapped(`• ${factor}`, 9, [71, 85, 105], false, 12);
  }
  y += 16;

  // 4. FRAGILE & UNSTATED ASSUMPTIONS
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. UNSTATED & FRAGILE ASSUMPTIONS (FOUNDATIONAL CRACKS)', margin, y);
  y += 6;
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  analysis.hiddenAssumptions.forEach((item, idx) => {
    checkPageBreak(55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Assumption 0${idx + 1}: ${item.assumption}`, margin, y);
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`[${item.fragilityLevel.toUpperCase()} FRAGILITY]`, pageWidth - margin - 100, y);
    y += 13;

    printWrapped(`• Vulnerability: ${item.vulnerability}`, 8.5, [71, 85, 105], false, 11);
    printWrapped(`• Stress-Test Query: ${item.stressTestQuestion}`, 8.5, [30, 58, 138], true, 11);
    y += 6;
  });
  y += 10;

  // 5. 2ND & 3RD ORDER CONSEQUENCES
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. OVERLOOKED 2nd & 3rd-ORDER CONSEQUENCES', margin, y);
  y += 6;
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  analysis.overlookedConsequences.forEach((item, idx) => {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.title} (${item.timeHorizon})`, margin, y);
    y += 13;

    printWrapped(item.explanation, 8.5, [71, 85, 105], false, 11);
    printWrapped(`• Foreclosed Opportunity Cost: ${item.opportunityCost}`, 8.5, [180, 83, 9], true, 11);
    y += 6;
  });
  y += 10;

  // 6. DUE DILIGENCE CHECKLIST
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. DUE DILIGENCE VERIFICATION INQUIRIES', margin, y);
  y += 6;
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  analysis.criticalMissingInfo.forEach((info, idx) => {
    checkPageBreak(40);
    const isInvestigated = investigatedIndices.includes(idx);
    const boxSymbol = isInvestigated ? '[X]' : '[ ]';
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    if (isInvestigated) {
      doc.setTextColor(5, 150, 105);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(boxSymbol, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(info.unknownFact, margin + 22, y);
    y += 12;

    printWrapped(`How to verify: ${info.howToFindOut}`, 8.5, [71, 85, 105], false, 11);
    y += 4;
  });
  y += 10;

  // 7. DECIDER NOTES & AUDIT TRAIL
  if (userNotes && userNotes.trim().length > 0) {
    checkPageBreak(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('5. DECIDER REFLECTIONS & AUDIT NOTES', margin, y);
    y += 6;
    doc.line(margin, y, margin + contentWidth, y);
    y += 16;

    printWrapped(userNotes, 8.5, [51, 65, 85], false, 12);
    y += 10;
  }

  // 8. CERTIFICATION FOOTER ON EVERY PAGE
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 38, pageWidth - margin, pageHeight - 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Aperture Decision Lab · Critical Cognitive Mirror · Moral agency belongs to the human decider.',
      margin,
      pageHeight - 24
    );

    doc.setFont('courier', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 55, pageHeight - 24);
  }

  // Save/Download PDF file
  const sanitizedTitle = decisionTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 35);
  doc.save(`aperture-decision-audit-${sanitizedTitle}.pdf`);
}
