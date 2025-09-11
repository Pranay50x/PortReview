import { jsPDF } from 'jspdf';

interface PDFOptions {
  title: string;
  subtitle?: string;
  filename: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 30;
  private readonly pageWidth = 210;
  private readonly pageHeight = 297;
  private readonly margin = 20;
  private readonly contentWidth = this.pageWidth - (this.margin * 2);

  constructor() {
    this.doc = new jsPDF();
    this.doc.setProperties({
      title: 'PortReview AI Report',
      subject: 'AI-Generated Analysis Report',
      author: 'PortReview AI System',
      creator: 'PortReview Platform'
    });
  }

  // Add header with branding
  private addHeader(title: string, subtitle?: string) {
    // Add PortReview branding
    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('PortReview AI Platform', this.margin, 15);
    
    // Add generation date
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const dateWidth = this.doc.getTextWidth(date);
    this.doc.text(date, this.pageWidth - this.margin - dateWidth, 15);

    // Add title
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, 30);
    
    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setTextColor(80, 80, 80);
      this.doc.text(subtitle, this.margin, 40);
      this.currentY = 50;
    } else {
      this.currentY = 40;
    }

    // Add separator line
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  // Add section header
  addSection(title: string, color: [number, number, number] = [0, 100, 200]) {
    this.checkPageBreak(20);
    
    // Section background
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(this.margin, this.currentY - 5, this.contentWidth, 15, 'F');
    
    // Section title
    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title, this.margin + 5, this.currentY + 5);
    
    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0);
  }

  // Add paragraph text
  addParagraph(text: string, fontSize: number = 11, color: [number, number, number] = [0, 0, 0]) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const lineHeight = fontSize * 0.5;
    
    this.checkPageBreak(lines.length * lineHeight + 10);
    
    for (const line of lines) {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += lineHeight;
    }
    this.currentY += 5;
  }

  // Add bullet points
  addBulletList(items: string[], bulletColor: [number, number, number] = [0, 100, 200]) {
    items.forEach((item) => {
      this.checkPageBreak(15);
      
      // Add bullet point
      this.doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
      this.doc.circle(this.margin + 3, this.currentY - 2, 1.5, 'F');
      
      // Add text
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      const lines = this.doc.splitTextToSize(item, this.contentWidth - 15);
      
      for (let i = 0; i < lines.length; i++) {
        this.doc.text(lines[i], this.margin + 10, this.currentY);
        this.currentY += 6;
      }
      this.currentY += 3;
    });
    this.currentY += 5;
  }

  // Add key-value pairs
  addKeyValuePairs(data: Record<string, string | number>, columns: number = 2) {
    const entries = Object.entries(data);
    const columnWidth = this.contentWidth / columns;
    
    this.checkPageBreak(Math.ceil(entries.length / columns) * 15 + 10);
    
    entries.forEach(([ key, value ], index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      
      const x = this.margin + (column * columnWidth);
      const y = this.currentY + (row * 12);
      
      // Key
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`${key}:`, x, y);
      
      // Value
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(String(value), x, y + 6);
    });
    
    this.currentY += Math.ceil(entries.length / columns) * 12 + 10;
  }

  // Add a data table
  addTable(headers: string[], rows: string[][]) {
    const columnWidth = this.contentWidth / headers.length;
    const rowHeight = 10;
    
    this.checkPageBreak((rows.length + 1) * rowHeight + 20);
    
    // Header
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY, this.contentWidth, rowHeight, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    headers.forEach((header, index) => {
      const x = this.margin + (index * columnWidth) + 2;
      this.doc.text(header, x, this.currentY + 6);
    });
    
    this.currentY += rowHeight;
    
    // Rows
    rows.forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.margin, this.currentY, this.contentWidth, rowHeight, 'F');
      }
      
      this.doc.setFontSize(9);
      row.forEach((cell, cellIndex) => {
        const x = this.margin + (cellIndex * columnWidth) + 2;
        this.doc.text(String(cell), x, this.currentY + 6);
      });
      
      this.currentY += rowHeight;
    });
    
    this.currentY += 10;
  }

  // Add metric cards
  addMetricCards(metrics: Array<{ label: string; value: string | number; color?: [number, number, number] }>) {
    const cardsPerRow = 3;
    const cardWidth = this.contentWidth / cardsPerRow - 5;
    const cardHeight = 25;
    
    this.checkPageBreak(Math.ceil(metrics.length / cardsPerRow) * cardHeight + 20);
    
    metrics.forEach((metric, index) => {
      const column = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);
      
      const x = this.margin + (column * (cardWidth + 5));
      const y = this.currentY + (row * (cardHeight + 5));
      
      // Card background
      const color = metric.color || [240, 240, 240];
      this.doc.setFillColor(color[0], color[1], color[2]);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
      
      // Value
      this.doc.setFontSize(16);
      this.doc.setTextColor(0, 0, 0);
      const valueWidth = this.doc.getTextWidth(String(metric.value));
      this.doc.text(String(metric.value), x + (cardWidth - valueWidth) / 2, y + 12);
      
      // Label
      this.doc.setFontSize(9);
      this.doc.setTextColor(100, 100, 100);
      const labelWidth = this.doc.getTextWidth(metric.label);
      this.doc.text(metric.label, x + (cardWidth - labelWidth) / 2, y + 20);
    });
    
    this.currentY += Math.ceil(metrics.length / cardsPerRow) * (cardHeight + 5) + 10;
  }

  // Check if we need a page break
  private checkPageBreak(spaceNeeded: number) {
    if (this.currentY + spaceNeeded > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  // Add footer to each page
  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setLineWidth(0.5);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Page number
      this.doc.setFontSize(10);
      this.doc.setTextColor(150, 150, 150);
      const pageText = `Page ${i} of ${pageCount}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageTextWidth, this.pageHeight - 10);
      
      // Company info
      this.doc.text('Generated by PortReview AI Platform', this.margin, this.pageHeight - 10);
    }
  }

  // Generate and download the PDF
  generatePDF(options: PDFOptions, content: () => void) {
    // Add header
    this.addHeader(options.title, options.subtitle);
    
    // Add content
    content();
    
    // Add footer
    this.addFooter();
    
    // Download
    this.doc.save(options.filename);
  }
}

// Utility functions for specific report types
export const createCandidateAnalysisPDF = (candidate: any, analysis: any) => {
  const pdf = new PDFGenerator();
  
  pdf.generatePDF({
    title: 'Candidate Analysis Report',
    subtitle: `Analysis for ${candidate.name} - ${candidate.role}`,
    filename: `${candidate.name.replace(/\s+/g, '_')}_Analysis_Report.pdf`
  }, () => {
    // Candidate Overview
    pdf.addSection('Candidate Overview', [52, 152, 219]);
    pdf.addKeyValuePairs({
      'Name': candidate.name,
      'Role': candidate.role,
      'Experience': candidate.experience || 'Not specified',
      'Location': candidate.location || 'Not specified'
    });
    
    // Skills
    if (candidate.skills && candidate.skills.length > 0) {
      pdf.addSection('Technical Skills', [46, 204, 113]);
      pdf.addParagraph(candidate.skills.join(', '));
    }
    
    // Analysis Results
    if (analysis.strengths && analysis.strengths.length > 0) {
      pdf.addSection('Key Strengths', [39, 174, 96]);
      pdf.addBulletList(analysis.strengths);
    }
    
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      pdf.addSection('Areas for Improvement', [231, 76, 60]);
      pdf.addBulletList(analysis.weaknesses);
    }
    
    // Scoring
    const metrics = [];
    if (analysis.technical_score !== undefined) metrics.push({ label: 'Technical Score', value: `${analysis.technical_score}%`, color: [52, 152, 219] as [number, number, number] });
    if (analysis.cultural_fit !== undefined) metrics.push({ label: 'Cultural Fit', value: `${analysis.cultural_fit}%`, color: [46, 204, 113] as [number, number, number] });
    if (analysis.experience_match !== undefined) metrics.push({ label: 'Experience Match', value: `${analysis.experience_match}%`, color: [155, 89, 182] as [number, number, number] });
    
    if (metrics.length > 0) {
      pdf.addSection('Assessment Scores', [155, 89, 182]);
      pdf.addMetricCards(metrics);
    }
    
    // Recommendations
    if (analysis.hiring_recommendation) {
      pdf.addSection('Hiring Recommendation', [230, 126, 34]);
      pdf.addParagraph(analysis.hiring_recommendation);
    }
  });
};

export const createInterviewKitPDF = (role: string, kit: any) => {
  const pdf = new PDFGenerator();
  
  pdf.generatePDF({
    title: 'Interview Kit',
    subtitle: `Comprehensive interview guide for ${role}`,
    filename: `${role.replace(/\s+/g, '_')}_Interview_Kit.pdf`
  }, () => {
    // Technical Questions
    if (kit.technical_questions && kit.technical_questions.length > 0) {
      pdf.addSection('Technical Questions', [52, 152, 219]);
      kit.technical_questions.forEach((q: any, index: number) => {
        pdf.addParagraph(`${index + 1}. ${q.question}`, 12, [0, 0, 0]);
        if (q.skill) pdf.addParagraph(`Skill Focus: ${q.skill}`, 10, [100, 100, 100]);
        if (q.difficulty) pdf.addParagraph(`Difficulty: ${q.difficulty}`, 10, [100, 100, 100]);
        if (q.expected_answer) {
          pdf.addParagraph('Expected Answer:', 11, [0, 100, 0]);
          pdf.addParagraph(q.expected_answer, 10, [50, 50, 50]);
        }
        pdf.addParagraph(''); // spacing
      });
    }
    
    // Behavioral Questions
    if (kit.behavioral_questions && kit.behavioral_questions.length > 0) {
      pdf.addSection('Behavioral Questions', [46, 204, 113]);
      kit.behavioral_questions.forEach((q: any, index: number) => {
        pdf.addParagraph(`${index + 1}. ${q.question}`, 12, [0, 0, 0]);
        if (q.purpose) pdf.addParagraph(`Purpose: ${q.purpose}`, 10, [100, 100, 100]);
        pdf.addParagraph(''); // spacing
      });
    }
    
    // Coding Challenges
    if (kit.coding_challenges && kit.coding_challenges.length > 0) {
      pdf.addSection('Coding Challenges', [231, 76, 60]);
      kit.coding_challenges.forEach((challenge: any, index: number) => {
        pdf.addParagraph(`${index + 1}. ${challenge.title || challenge.question}`, 12, [0, 0, 0]);
        if (challenge.difficulty) pdf.addParagraph(`Difficulty: ${challenge.difficulty}`, 10, [100, 100, 100]);
        if (challenge.description) pdf.addParagraph(challenge.description, 10, [50, 50, 50]);
        pdf.addParagraph(''); // spacing
      });
    }
  });
};

export const createHiringPredictionPDF = (candidate: any, prediction: any) => {
  const pdf = new PDFGenerator();
  
  pdf.generatePDF({
    title: 'Hiring Prediction Report',
    subtitle: `Success prediction for ${candidate.name}`,
    filename: `${candidate.name.replace(/\s+/g, '_')}_Hiring_Prediction.pdf`
  }, () => {
    // Candidate Info
    pdf.addSection('Candidate Profile', [52, 152, 219]);
    pdf.addKeyValuePairs({
      'Name': candidate.name,
      'Role': candidate.role,
      'Experience': candidate.experience || 'Not specified',
      'Location': candidate.location || 'Not specified'
    });
    
    // Prediction Metrics
    pdf.addSection('Prediction Results', [46, 204, 113]);
    const metrics = [
      { label: 'Success Probability', value: `${Math.round(prediction.success_probability * 100)}%`, color: [52, 152, 219] as [number, number, number] },
      { label: 'Confidence Level', value: prediction.confidence_level, color: [46, 204, 113] as [number, number, number] },
      { label: 'Performance Prediction', value: prediction.performance_prediction, color: [155, 89, 182] as [number, number, number] }
    ];
    pdf.addMetricCards(metrics);
    
    // Success Factors
    if (prediction.key_success_factors && prediction.key_success_factors.length > 0) {
      pdf.addSection('Key Success Factors', [39, 174, 96]);
      pdf.addBulletList(prediction.key_success_factors);
    }
    
    // Risk Factors
    if (prediction.potential_risks && prediction.potential_risks.length > 0) {
      pdf.addSection('Potential Risks', [231, 76, 60]);
      pdf.addBulletList(prediction.potential_risks);
    }
    
    // Onboarding Recommendations
    if (prediction.onboarding_recommendations && prediction.onboarding_recommendations.length > 0) {
      pdf.addSection('Onboarding Recommendations', [230, 126, 34]);
      pdf.addBulletList(prediction.onboarding_recommendations);
    }
  });
};

export const createMarketAnalysisPDF = (formData: any, insights: any) => {
  const pdf = new PDFGenerator();
  
  pdf.generatePDF({
    title: 'Market Analysis Report',
    subtitle: `Market insights for ${formData.role} in ${formData.location}`,
    filename: `${formData.role.replace(/\s+/g, '_')}_Market_Analysis.pdf`
  }, () => {
    // Job Requirements
    pdf.addSection('Analysis Parameters', [52, 152, 219]);
    pdf.addKeyValuePairs({
      'Role': formData.role,
      'Location': formData.location,
      'Experience Level': formData.experience || 'Not specified',
      'Skills Focus': formData.skills || 'Not specified'
    });
    
    // Market Demand
    pdf.addSection('Market Demand Analysis', [46, 204, 113]);
    const demandMetrics = [
      { label: 'Demand/Supply Ratio', value: `${insights.market_demand.demand_supply_ratio}x`, color: [231, 76, 60] as [number, number, number] },
      { label: 'Competition Level', value: insights.market_demand.competition_level, color: [230, 126, 34] as [number, number, number] },
      { label: 'Hiring Difficulty', value: insights.market_demand.hiring_difficulty, color: [155, 89, 182] as [number, number, number] }
    ];
    pdf.addMetricCards(demandMetrics);
    
    // Hot Skills
    if (insights.hot_skills && insights.hot_skills.length > 0) {
      pdf.addSection('Hot Skills in Demand', [39, 174, 96]);
      pdf.addBulletList(insights.hot_skills);
    }
    
    // Emerging Technologies
    if (insights.emerging_technologies && insights.emerging_technologies.length > 0) {
      pdf.addSection('Emerging Technologies', [142, 68, 173]);
      pdf.addBulletList(insights.emerging_technologies);
    }
    
    // Salary Trends
    if (insights.salary_trends && Object.keys(insights.salary_trends).length > 0) {
      pdf.addSection('Salary Growth Trends', [26, 188, 156]);
      const salaryData = Object.entries(insights.salary_trends).map(([skill, growth]) => [
        skill, `+${growth}%`
      ]);
      pdf.addTable(['Skill', 'Growth Rate'], salaryData);
    }
    
    // Recommendations
    if (insights.recommendations && insights.recommendations.length > 0) {
      pdf.addSection('Strategic Recommendations', [230, 126, 34]);
      pdf.addBulletList(insights.recommendations);
    }
  });
};

export const createJobDescriptionPDF = (formData: any, jobDescription: string) => {
  const pdf = new PDFGenerator();
  
  pdf.generatePDF({
    title: 'Job Description',
    subtitle: `${formData.role} at ${formData.company}`,
    filename: `${formData.role.replace(/\s+/g, '_')}_Job_Description.pdf`
  }, () => {
    // Job Overview
    pdf.addSection('Job Overview', [52, 152, 219]);
    pdf.addKeyValuePairs({
      'Position': formData.role,
      'Company': formData.company,
      'Location': formData.location || 'Not specified',
      'Experience Level': formData.experience || 'Not specified'
    });
    
    // Job Description Content
    pdf.addSection('Job Description', [46, 204, 113]);
    
    // Parse markdown-like content and add to PDF
    const lines = jobDescription.split('\n');
    let currentSection = '';
    let bulletPoints: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('#')) {
        // Add previous bullet points if any
        if (bulletPoints.length > 0) {
          pdf.addBulletList(bulletPoints);
          bulletPoints = [];
        }
        
        // Add section header
        const headerText = trimmedLine.replace(/#+\s*/, '');
        if (headerText && headerText !== currentSection) {
          pdf.addSection(headerText, [100, 100, 100]);
          currentSection = headerText;
        }
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // Collect bullet points
        bulletPoints.push(trimmedLine.substring(2));
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Bold text as subsection
        const boldText = trimmedLine.replace(/\*\*/g, '');
        pdf.addParagraph(boldText, 12, [0, 0, 0]);
      } else if (trimmedLine.length > 0) {
        // Add previous bullet points if switching to paragraph
        if (bulletPoints.length > 0) {
          pdf.addBulletList(bulletPoints);
          bulletPoints = [];
        }
        
        // Regular paragraph
        pdf.addParagraph(trimmedLine);
      }
    }
    
    // Add any remaining bullet points
    if (bulletPoints.length > 0) {
      pdf.addBulletList(bulletPoints);
    }
  });
};
