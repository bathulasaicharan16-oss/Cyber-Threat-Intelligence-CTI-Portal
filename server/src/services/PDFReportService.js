import PDFDocument from 'pdfkit';

class PDFReportService {
  /**
   * Generates a PDF stream / buffer for a report record
   */
  async generatePDF(reportDoc) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: reportDoc.title,
            Author: 'Cyber Threat Intelligence Portal (BCS 502)',
            Subject: 'Consolidated Threat Intelligence Briefing',
          },
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // ---------------- HEADER SECTION ----------------
        // Top Banner Bar
        doc.rect(40, 40, 515, 60).fill('#0f172a'); // Slate-900
        
        doc.fillColor('#38bdf8').fontSize(16).font('Helvetica-Bold')
           .text('CYBER THREAT INTELLIGENCE PORTAL', 55, 52);
        
        doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
           .text('Software Engineering Project (BCS 502) • Amity University Rajasthan', 55, 74);
        
        doc.fillColor('#f8fafc').fontSize(10).font('Helvetica-Bold')
           .text(`REPORT ID: ${reportDoc.reportId}`, 400, 52, { align: 'right', width: 140 });
        
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
           .text(`Generated: ${new Date(reportDoc.createdDate || Date.now()).toLocaleDateString()}`, 400, 68, { align: 'right', width: 140 });

        doc.moveDown(3);

        // ---------------- PROJECT CREDITS BAR ----------------
        doc.rect(40, 110, 515, 45).fill('#1e293b');
        doc.fillColor('#e2e8f0').fontSize(8.5).font('Helvetica-Bold')
           .text('PROJECT AUTHORS & SUPERVISOR CREDITS', 55, 118);
        doc.fillColor('#cbd5e1').fontSize(8).font('Helvetica')
           .text('Submitted by: B. Sai Charan (A20405224070) & D. Ganesh Ravichandu (A20405224296) | B.Tech CSE (5th Sem, Sec A)', 55, 130)
           .text('Supervisor: Dr. Deepti Saxena | Academic Year: 2026–2027', 55, 142);

        // ---------------- TITLE & EXECUTIVE SUMMARY ----------------
        doc.moveDown(4);
        doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold')
           .text(reportDoc.title, 40, 175);
        
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica')
           .text(`Author / Analyst: ${reportDoc.authorName || 'TI Researcher'}  |  Format: Standard SOC Threat Intel (PDF)`, 40, 195);

        // Executive Summary Box
        doc.rect(40, 215, 515, 65).fill('#f1f5f9').stroke('#cbd5e1');
        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold')
           .text('EXECUTIVE THREAT SUMMARY', 50, 222);
        
        const summaryText = reportDoc.executiveSummary || 
          `This threat intelligence briefing compiles validated vulnerability data, active indicators of compromise (IOCs), malware telemetry, and MITRE ATT&CK tactic mappings. Immediate patching and network egress filtering are recommended for flagged perimeter infrastructure.`;
        
        doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
           .text(summaryText, 50, 236, { width: 495, lineGap: 2 });

        let currentY = 295;

        // ---------------- SECTION 1: CVE VULNERABILITIES ----------------
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
           .text('1. VULNERABILITY INTELLIGENCE (CVEs)', 40, currentY);
        currentY += 18;

        if (reportDoc.records?.cves && reportDoc.records.cves.length > 0) {
          reportDoc.records.cves.forEach((cve) => {
            doc.rect(40, currentY, 515, 42).fill('#f8fafc').stroke('#e2e8f0');
            
            // Badge color
            const isCrit = cve.severity === 'CRITICAL' || cve.cvssScore >= 9.0;
            doc.rect(50, currentY + 7, 75, 16).fill(isCrit ? '#ef4444' : '#f59e0b');
            doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
               .text(`${cve.severity} (${cve.cvssScore})`, 50, currentY + 11, { width: 75, align: 'center' });

            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
               .text(cve.cveId, 135, currentY + 10);
            
            doc.fillColor('#475569').fontSize(8).font('Helvetica')
               .text(cve.description.slice(0, 110) + '...', 135, currentY + 23, { width: 410 });

            currentY += 48;
          });
        } else {
          doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica-Oblique')
             .text('No CVE records included in this report.', 50, currentY);
          currentY += 20;
        }

        currentY += 10;

        // ---------------- SECTION 2: INDICATORS OF COMPROMISE (IOCs) ----------------
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
           .text('2. INDICATORS OF COMPROMISE (IOCs)', 40, currentY);
        currentY += 18;

        if (reportDoc.records?.iocs && reportDoc.records.iocs.length > 0) {
          reportDoc.records.iocs.forEach((ioc) => {
            doc.rect(40, currentY, 515, 36).fill('#f8fafc').stroke('#e2e8f0');
            
            doc.rect(50, currentY + 7, 50, 16).fill('#6366f1');
            doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
               .text(ioc.type || 'IP', 50, currentY + 11, { width: 50, align: 'center' });

            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
               .text(ioc.value, 110, currentY + 10);

            doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica-Bold')
               .text(`Abuse Confidence: ${ioc.abuseConfidence || 0}%`, 330, currentY + 10);

            doc.fillColor('#475569').fontSize(8).font('Helvetica')
               .text(`Consolidated Threat Score: ${ioc.reputationScore || 0} / 100`, 330, currentY + 22);

            currentY += 42;
          });
        } else {
          doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica-Oblique')
             .text('No IOC records included in this report.', 50, currentY);
          currentY += 20;
        }

        currentY += 10;

        // ---------------- SECTION 3: MALWARE ARTIFACTS ----------------
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
           .text('3. MALWARE SAMPLE TELEMETRY', 40, currentY);
        currentY += 18;

        if (reportDoc.records?.malwareSamples && reportDoc.records.malwareSamples.length > 0) {
          reportDoc.records.malwareSamples.forEach((mal) => {
            doc.rect(40, currentY, 515, 36).fill('#f8fafc').stroke('#e2e8f0');

            doc.rect(50, currentY + 7, 55, 16).fill('#dc2626');
            doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
               .text(`${(mal.detectionRatio * 100).toFixed(0)}% DET`, 50, currentY + 11, { width: 55, align: 'center' });

            doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
               .text(mal.fileName || 'Sample', 115, currentY + 10);

            doc.fillColor('#64748b').fontSize(8).font('Helvetica')
               .text(`Hash: ${mal.hash.slice(0, 32)}...`, 115, currentY + 22);

            doc.fillColor('#4338ca').fontSize(8.5).font('Helvetica-Bold')
               .text(`Family: ${mal.malwareFamily}`, 350, currentY + 10);

            currentY += 42;
          });
        } else {
          doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica-Oblique')
             .text('No Malware samples included in this report.', 50, currentY);
          currentY += 20;
        }

        currentY += 10;

        // ---------------- SECTION 4: MITRE ATT&CK MAPPINGS ----------------
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
           .text('4. MITRE ATT&CK THREAT MAPPING MATRIX', 40, currentY);
        currentY += 18;

        if (reportDoc.records?.mitreMappings && reportDoc.records.mitreMappings.length > 0) {
          reportDoc.records.mitreMappings.forEach((m) => {
            doc.rect(40, currentY, 515, 34).fill('#f1f5f9').stroke('#cbd5e1');

            doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold')
               .text(`Tactic: ${m.tacticId} - ${m.tacticName}`, 50, currentY + 8);

            doc.fillColor('#2563eb').fontSize(8.5).font('Helvetica-Bold')
               .text(`Technique: ${m.techniqueId} - ${m.techniqueName}`, 260, currentY + 8);

            doc.fillColor('#475569').fontSize(8).font('Helvetica')
               .text(`Linked Entity: ${m.linkedRef}`, 50, currentY + 20);

            currentY += 38;
          });
        } else {
          doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica-Oblique')
             .text('No MITRE mappings associated with these items.', 50, currentY);
          currentY += 20;
        }

        // ---------------- FOOTER ----------------
        doc.rect(40, 765, 515, 25).fill('#0f172a');
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
           .text('CONFIDENTIAL • FOR AUTHORIZED SOC & INCIDENT RESPONSE PERSONNEL ONLY', 55, 773);
        doc.fillColor('#38bdf8').fontSize(8).font('Helvetica-Bold')
           .text('AMITY UNIVERSITY RAJASTHAN', 400, 773, { align: 'right', width: 140 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new PDFReportService();
