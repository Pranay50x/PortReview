from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import datetime
from typing import Dict, Any, List
import io
import tempfile
import os

class PDFReportGenerator:
    """
    Professional PDF report generator for PortReview AI reports
    """
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Setup custom styles for professional reports"""
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=HexColor('#1e40af'),  # Blue
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=HexColor('#6b7280'),  # Gray
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=HexColor('#1f2937'),  # Dark gray
            backColor=HexColor('#f3f4f6'),  # Light gray background
            spaceAfter=12,
            spaceBefore=20,
            leftIndent=10,
            borderPadding=8
        ))
        
        # Key metric style
        self.styles.add(ParagraphStyle(
            name='KeyMetric',
            parent=self.styles['Normal'],
            fontSize=18,
            textColor=HexColor('#059669'),  # Green
            alignment=TA_CENTER,
            spaceAfter=10
        ))
        
        # Bullet point style
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=11,
            leftIndent=20,
            bulletIndent=10,
            spaceAfter=6
        ))

    def _add_header(self, elements: List, title: str, subtitle: str = None):
        """Add professional header to the report"""
        
        # Company branding
        brand_data = [
            ['PortReview AI Platform', datetime.now().strftime('%B %d, %Y')]
        ]
        brand_table = Table(brand_data, colWidths=[4*inch, 2*inch])
        brand_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, 0), HexColor('#6b7280')),
            ('TEXTCOLOR', (1, 0), (1, 0), HexColor('#6b7280')),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(brand_table)
        elements.append(Spacer(1, 12))
        
        # Title
        elements.append(Paragraph(title, self.styles['CustomTitle']))
        
        # Subtitle if provided
        if subtitle:
            elements.append(Paragraph(subtitle, self.styles['CustomSubtitle']))
            
        # Separator line
        elements.append(Spacer(1, 12))
        
    def _add_section(self, elements: List, title: str, content: List[str] = None, 
                    table_data: List[List[str]] = None, metrics: List[Dict] = None):
        """Add a section to the report"""
        
        # Section header
        elements.append(Paragraph(title, self.styles['SectionHeader']))
        
        # Key metrics display
        if metrics:
            metric_data = []
            metric_row = []
            for i, metric in enumerate(metrics):
                metric_text = f"<b>{metric['value']}</b><br/>{metric['label']}"
                metric_row.append(metric_text)
                if (i + 1) % 3 == 0 or i == len(metrics) - 1:
                    metric_data.append(metric_row)
                    metric_row = []
            
            metric_table = Table(metric_data, colWidths=[2*inch] * min(3, len(metrics)))
            metric_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f8fafc')),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#e2e8f0')),
                ('PADDING', (0, 0), (-1, -1), 12),
            ]))
            elements.append(metric_table)
            elements.append(Spacer(1, 12))
        
        # Table data
        if table_data:
            table = Table(table_data[1:], colWidths=[2*inch, 3*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#f1f5f9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#1e293b')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
            elements.append(Spacer(1, 12))
        
        # Content paragraphs and bullet points
        if content:
            for item in content:
                if item.startswith('• ') or item.startswith('- '):
                    # Bullet point
                    elements.append(Paragraph(item, self.styles['BulletPoint']))
                else:
                    # Regular paragraph
                    elements.append(Paragraph(item, self.styles['Normal']))
                    elements.append(Spacer(1, 6))

    def generate_candidate_analysis_pdf(self, candidate_data: Dict[str, Any], 
                                      analysis_data: Dict[str, Any]) -> bytes:
        """Generate candidate analysis PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        self._add_header(elements, 
                        "Candidate Analysis Report",
                        f"Analysis for {candidate_data.get('name', 'Unknown')} - {candidate_data.get('role', 'Unknown Role')}")
        
        # Candidate Overview
        overview_data = [
            ['Field', 'Value'],
            ['Name', candidate_data.get('name', 'N/A')],
            ['Role', candidate_data.get('role', 'N/A')],
            ['Experience', candidate_data.get('experience', 'N/A')],
            ['Location', candidate_data.get('location', 'N/A')],
        ]
        self._add_section(elements, "Candidate Overview", table_data=overview_data)
        
        # Analysis Scores
        metrics = []
        if 'technical_score' in analysis_data:
            metrics.append({'label': 'Technical Score', 'value': f"{analysis_data['technical_score']}%"})
        if 'cultural_fit' in analysis_data:
            metrics.append({'label': 'Cultural Fit', 'value': f"{analysis_data['cultural_fit']}%"})
        if 'experience_match' in analysis_data:
            metrics.append({'label': 'Experience Match', 'value': f"{analysis_data.get('experience_match', 'N/A')}%"})
        
        if metrics:
            self._add_section(elements, "Assessment Scores", metrics=metrics)
        
        # Strengths
        if 'strengths' in analysis_data:
            strengths = [f"• {strength}" for strength in analysis_data['strengths']]
            self._add_section(elements, "Key Strengths", content=strengths)
        
        # Areas for Improvement
        if 'weaknesses' in analysis_data:
            weaknesses = [f"• {weakness}" for weakness in analysis_data['weaknesses']]
            self._add_section(elements, "Areas for Improvement", content=weaknesses)
        
        # Hiring Recommendation
        if 'hiring_recommendation' in analysis_data:
            self._add_section(elements, "Hiring Recommendation", 
                            content=[analysis_data['hiring_recommendation']])
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_market_analysis_pdf(self, form_data: Dict[str, Any], 
                                   insights_data: Dict[str, Any]) -> bytes:
        """Generate market analysis PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        self._add_header(elements, 
                        "Market Analysis Report",
                        f"Market insights for {form_data.get('role', 'Unknown Role')} in {form_data.get('location', 'Unknown Location')}")
        
        # Analysis Parameters
        params_data = [
            ['Parameter', 'Value'],
            ['Role', form_data.get('role', 'N/A')],
            ['Location', form_data.get('location', 'N/A')],
            ['Experience Level', form_data.get('experience', 'N/A')],
            ['Skills Focus', form_data.get('skills', 'N/A')],
        ]
        self._add_section(elements, "Analysis Parameters", table_data=params_data)
        
        # Market Demand Metrics
        market_demand = insights_data.get('market_demand', {})
        demand_metrics = [
            {'label': 'Demand/Supply Ratio', 'value': f"{market_demand.get('demand_supply_ratio', 'N/A')}x"},
            {'label': 'Competition Level', 'value': market_demand.get('competition_level', 'N/A')},
            {'label': 'Hiring Difficulty', 'value': market_demand.get('hiring_difficulty', 'N/A')},
        ]
        self._add_section(elements, "Market Demand Analysis", metrics=demand_metrics)
        
        # Hot Skills
        if 'hot_skills' in insights_data:
            skills = [f"• {skill}" for skill in insights_data['hot_skills']]
            self._add_section(elements, "Hot Skills in Demand", content=skills)
        
        # Emerging Technologies
        if 'emerging_technologies' in insights_data:
            tech = [f"• {technology}" for technology in insights_data['emerging_technologies']]
            self._add_section(elements, "Emerging Technologies", content=tech)
        
        # Salary Trends
        if 'salary_trends' in insights_data:
            salary_data = [['Skill', 'Growth Rate']]
            for skill, growth in insights_data['salary_trends'].items():
                salary_data.append([skill, f"+{growth}%"])
            self._add_section(elements, "Salary Growth Trends", table_data=salary_data)
        
        # Recommendations
        if 'recommendations' in insights_data:
            recommendations = [f"• {rec}" for rec in insights_data['recommendations']]
            self._add_section(elements, "Strategic Recommendations", content=recommendations)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_hiring_prediction_pdf(self, candidate_data: Dict[str, Any], 
                                     prediction_data: Dict[str, Any]) -> bytes:
        """Generate hiring prediction PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        self._add_header(elements, 
                        "Hiring Prediction Report",
                        f"Success prediction for {candidate_data.get('name', 'Unknown Candidate')}")
        
        # Candidate Profile
        profile_data = [
            ['Field', 'Value'],
            ['Name', candidate_data.get('name', 'N/A')],
            ['Role', candidate_data.get('role', 'N/A')],
            ['Experience', candidate_data.get('experience', 'N/A')],
            ['Location', candidate_data.get('location', 'N/A')],
        ]
        self._add_section(elements, "Candidate Profile", table_data=profile_data)
        
        # Prediction Metrics
        success_prob = prediction_data.get('success_probability', 0)
        prediction_metrics = [
            {'label': 'Success Probability', 'value': f"{int(success_prob * 100)}%"},
            {'label': 'Confidence Level', 'value': prediction_data.get('confidence_level', 'N/A')},
            {'label': 'Performance Prediction', 'value': prediction_data.get('performance_prediction', 'N/A')},
        ]
        self._add_section(elements, "Prediction Results", metrics=prediction_metrics)
        
        # Success Factors
        if 'key_success_factors' in prediction_data:
            factors = [f"• {factor}" for factor in prediction_data['key_success_factors']]
            self._add_section(elements, "Key Success Factors", content=factors)
        
        # Risk Factors
        if 'potential_risks' in prediction_data:
            risks = [f"• {risk}" for risk in prediction_data['potential_risks']]
            self._add_section(elements, "Potential Risks", content=risks)
        
        # Onboarding Recommendations
        if 'onboarding_recommendations' in prediction_data:
            recommendations = [f"• {rec}" for rec in prediction_data['onboarding_recommendations']]
            self._add_section(elements, "Onboarding Recommendations", content=recommendations)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_interview_kit_pdf(self, role: str, kit_data: Dict[str, Any]) -> bytes:
        """Generate interview kit PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        self._add_header(elements, 
                        "Interview Kit",
                        f"Comprehensive interview guide for {role}")
        
        # Technical Questions
        if 'technical_questions' in kit_data and kit_data['technical_questions']:
            tech_content = []
            for i, q in enumerate(kit_data['technical_questions'], 1):
                tech_content.append(f"<b>{i}. {q.get('question', 'N/A')}</b>")
                tech_content.append(f"Skill Focus: {q.get('skill', 'N/A')}")
                tech_content.append(f"Difficulty: {q.get('difficulty', 'N/A')}")
                if q.get('expected_answer'):
                    tech_content.append(f"Expected Answer: {q.get('expected_answer')}")
                tech_content.append("")  # Empty line for spacing
            
            self._add_section(elements, "Technical Questions", content=tech_content)
        
        # Behavioral Questions
        if 'behavioral_questions' in kit_data and kit_data['behavioral_questions']:
            behavioral_content = []
            for i, q in enumerate(kit_data['behavioral_questions'], 1):
                behavioral_content.append(f"<b>{i}. {q.get('question', 'N/A')}</b>")
                if q.get('purpose'):
                    behavioral_content.append(f"Purpose: {q.get('purpose')}")
                behavioral_content.append("")  # Empty line for spacing
            
            self._add_section(elements, "Behavioral Questions", content=behavioral_content)
        
        # Coding Challenges
        if 'coding_challenges' in kit_data and kit_data['coding_challenges']:
            coding_content = []
            for i, c in enumerate(kit_data['coding_challenges'], 1):
                coding_content.append(f"<b>{i}. {c.get('title', c.get('question', 'N/A'))}</b>")
                if c.get('description'):
                    coding_content.append(f"Description: {c.get('description')}")
                coding_content.append(f"Difficulty: {c.get('difficulty', 'N/A')}")
                coding_content.append("")  # Empty line for spacing
            
            self._add_section(elements, "Coding Challenges", content=coding_content)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_job_description_pdf(self, form_data: Dict[str, Any], 
                                   job_description: str) -> bytes:
        """Generate job description PDF report"""
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Header
        self._add_header(elements, 
                        "Job Description",
                        f"{form_data.get('role', 'Unknown Role')} at {form_data.get('company', 'Unknown Company')}")
        
        # Job Overview
        overview_data = [
            ['Field', 'Value'],
            ['Position', form_data.get('role', 'N/A')],
            ['Company', form_data.get('company', 'N/A')],
            ['Location', form_data.get('location', 'N/A')],
            ['Experience Level', form_data.get('experience', 'N/A')],
        ]
        self._add_section(elements, "Job Overview", table_data=overview_data)
        
        # Job Description Content
        # Parse the markdown-like content
        lines = job_description.split('\n')
        current_content = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('#'):
                # Add previous section if exists
                if current_content:
                    self._add_section(elements, "Job Description", content=current_content)
                    current_content = []
                
                # Start new section
                section_title = line.replace('#', '').strip()
                if section_title:
                    elements.append(Paragraph(section_title, self.styles['SectionHeader']))
            elif line.startswith('- ') or line.startswith('* '):
                current_content.append(f"• {line[2:]}")
            elif line:
                current_content.append(line)
        
        # Add remaining content
        if current_content:
            for item in current_content:
                elements.append(Paragraph(item, self.styles['Normal']))
                elements.append(Spacer(1, 6))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

# Global instance
pdf_generator = PDFReportGenerator()
