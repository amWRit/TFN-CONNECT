// prisma/seed-skills-categories.ts - SEED 20 CATEGORIES + 200 SKILLS
// Run: npx ts-node prisma/seed-skills-categories.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 20 RESEARCH-BACKED CATEGORIES (WEF Future of Jobs 2025)
const CATEGORIES = [
  'Cognitive & Analytical Skills',
  'Interpersonal & Social Skills', 
  'Self-Management Skills',
  'Technology & Digital Skills',
  'Business & Management Skills',
  'Creative & Design Skills',
  'Professional Tools',
  'Industry-Specific Skills',
  'Language Skills',
  'Sustainability Skills',
  'Leadership & Management Skills',
  'Customer Service & Sales Skills',
  'Operations & Logistics Skills',
  'Healthcare & Caregiving Skills',
  'Legal & Compliance Skills',
  'HR & Talent Management Skills',
  'Marketing & Media Skills',
  'Financial & Accounting Skills',
  'Project & Quality Management Skills',
  'Customer Success Skills',
  'Education & Training Skills'
];

// SKILLS BY CATEGORY (200+ total)
const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'Cognitive & Analytical Skills': [
    'Analytical Thinking', 'Critical Thinking', 'Problem-Solving', 'Creative Thinking',
    'Systems Thinking', 'Decision Making', 'Research Skills', 'Data Analysis',
    'Logical Reasoning', 'Pattern Recognition'
  ],
  'Interpersonnal & Social Skills': [
    'Communication (Verbal)', 'Communication (Written)', 'Active Listening', 'Teamwork',
    'Collaboration', 'Networking', 'Relationship Building', 'Persuasion', 'Conflict Resolution', 'Empathy'
  ],
  'Self-Management Skills': [
    'Time Management', 'Adaptability', 'Resilience', 'Emotional Intelligence',
    'Stress Management', 'Self-Motivation', 'Discipline', 'Initiative', 'Work Ethic', 'Lifelong Learning'
  ],
  'Technology & Digital Skills': [
    'Programming (Python)', 'Programming (JavaScript)', 'Web Development', 'Data Analysis Tools',
    'Cloud Computing', 'Cybersecurity', 'AI/ML Basics', 'Digital Marketing', 'Database Management', 'Automation'
  ],
  'Business & Management Skills': [
    'Project Management', 'Strategic Planning', 'Business Development', 'Operations Management',
    'Risk Management', 'Stakeholder Management', 'Process Improvement', 'Change Management', 'Performance Management', 'Budgeting'
  ],
  'Creative & Design Skills': [
    'Graphic Design', 'UI/UX Design', 'Branding', 'Content Creation', 'Photography',
    'Video Production', 'Animation', 'Illustration', 'Creative Writing', 'Visual Storytelling'
  ],
  'Professional Tools': [
    'Microsoft Office Suite', 'Google Workspace', 'Project Management Tools', 'CRM Software',
    'Analytics Tools', 'Collaboration Tools', 'Design Software', 'Accounting Software', 'Communication Platforms', 'Spreadsheet Mastery'
  ],
  'Industry-Specific Skills': [
    'Sales Techniques', 'Customer Service', 'Account Management', 'Supply Chain Management',
    'Legal Research', 'Compliance', 'Healthcare Administration', 'HR Management', 'Quality Assurance', 'Vendor Management'
  ],
  'Language Skills': [
    'English (Professional)', 'Nepali (Professional)', 'Hindi', 'Multilingual Communication',
    'Technical Writing', 'Presentation Skills', 'Translation', 'Localization', 'Language Teaching', 'Cross-Cultural Communication'
  ],
  'Sustainability Skills': [
    'Environmental Stewardship', 'Sustainable Business Practices', 'Carbon Footprint Reduction',
    'ESG Reporting', 'Green Supply Chain', 'Renewable Energy Knowledge', 'Waste Management', 'Climate Adaptation', 'Sustainability Auditing', 'Circular Economy'
  ],
  'Leadership & Management Skills': [
    'Team Leadership', 'Executive Leadership', 'Coaching & Mentoring', 'Performance Coaching',
    'Strategic Leadership', 'Organizational Development', 'Talent Development', 'Crisis Leadership', 'Vision Setting', 'Delegation'
  ],
  'Customer Service & Sales Skills': [
    'Customer Relationship Management', 'Sales Funnel Management', 'Lead Generation', 'Closing Techniques',
    'Customer Retention', 'Complaint Resolution', 'Upselling/Cross-selling', 'Client Onboarding', 'Customer Success', 'B2B Sales'
  ],
  'Operations & Logistics Skills': [
    'Inventory Management', 'Supply Chain Optimization', 'Warehouse Management', 'Logistics Planning',
    'Procurement', 'Distribution', 'Process Automation', 'Lean Operations', 'Six Sigma', 'Capacity Planning'
  ],
  'Healthcare & Caregiving Skills': [
    'Patient Care', 'Medical Terminology', 'Care Coordination', 'Health & Safety Protocols',
    'First Aid/CPR', 'Elderly Care', 'Childcare', 'Mental Health Support', 'Medical Billing', 'Telehealth'
  ],
  'Legal & Compliance Skills': [
    'Contract Management', 'Regulatory Compliance', 'Legal Research', 'Risk Assessment',
    'Policy Development', 'GDPR/Privacy Compliance', 'Corporate Governance', 'Intellectual Property', 'Employment Law', 'Audit Preparation'
  ],
  'HR & Talent Management Skills': [
    'Recruitment & Selection', 'Employee Onboarding', 'Performance Appraisal', 'Training & Development',
    'Employee Relations', 'Compensation & Benefits', 'Diversity & Inclusion', 'Succession Planning', 'Labor Law Compliance', 'HR Analytics'
  ],
  'Marketing & Media Skills': [
    'SEO/SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
    'Brand Management', 'Market Research', 'Advertising', 'Public Relations', 'Influencer Marketing', 'Growth Hacking'
  ],
  'Financial & Accounting Skills': [
    'Financial Analysis', 'Bookkeeping', 'Budgeting & Forecasting', 'Tax Preparation',
    'Financial Reporting', 'Cost Accounting', 'Investment Analysis', 'Cash Flow Management', 'Auditing', 'Financial Modeling'
  ],
  'Project & Quality Management Skills': [
    'Agile/Scrum Methodology', 'Waterfall Project Management', 'Risk Management',
    'Quality Assurance', 'Scope Management', 'Resource Allocation', 'Timeline Management', 'Vendor Coordination', 'KPI Development', 'Continuous Improvement'
  ],
  'Customer Success Skills': [
    'Client Onboarding', 'Account Management', 'Customer Training', 'Success Planning',
    'Churn Prevention', 'Product Adoption', 'Customer Feedback Analysis', 'Renewal Management', 'Customer Advocacy', 'Satisfaction Metrics'
  ],
    'Education & Training Skills': [
        'Lesson Planning', 'Classroom Management', 'Curriculum Development', 'Student Assessment',
        'Differentiated Instruction', 'Inclusive Teaching', 'Active Learning Strategies', 'Educational Technology',
        'Behavior Management', 'Parent Communication', 'Formative Assessment', 'Student Engagement',
        'Instructional Design', 'Learning Differentiation', 'Pedagogical Content Knowledge',
        'Student-Centered Learning', 'Assessment Design', 'Classroom Technology Integration',
        'Professional Development', 'Teaching Methodology', 'Individualized Education Plans (IEP)',
        'Cooperative Learning', 'Inquiry-Based Learning', 'Project-Based Learning', 'Flipped Classroom',
        'Mentoring & Coaching'
    ]
};

async function main() {
  console.log('🌱 Seeding Skills & Categories...\n');

  let categoryCount = 0;
  let skillCount = 0;
  let relationCount = 0;

  try {
    // 1. SEED CATEGORIES (20 total)
    for (const categoryName of CATEGORIES) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName }
      });
      categoryCount++;
      console.log(`✅ Category: ${category.name}`);
    }

    // 2. SEED SKILLS + RELATIONS (200+ total)
    for (const [categoryName, skills] of Object.entries(SKILLS_BY_CATEGORY)) {
      const category = await prisma.category.findUnique({
        where: { name: categoryName }
      });

      if (!category) continue;

      for (const skillName of skills) {
        // Create/upsert skill
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName }
        });

        // Create category relation (if not exists)
        await prisma.skillCategory.upsert({
          where: {
            skillId_categoryId: {
              skillId: skill.id,
              categoryId: category.id
            }
          },
          update: {},
          create: {
            skillId: skill.id,
            categoryId: category.id
          }
        });

        skillCount++;
        relationCount++;
      }
      
      console.log(`✅ ${categoryName}: ${skills.length} skills`);
    }

    console.log('\n🎉 SEEDING COMPLETE!');
    console.log(`📊 SUMMARY:`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Skills:     ${skillCount}`);
    console.log(`   Relations:  ${relationCount}`);

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
