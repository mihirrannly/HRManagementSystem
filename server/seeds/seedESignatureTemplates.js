const mongoose = require('mongoose');
const { DocumentTemplate } = require('../models/ESignature');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const templates = [
  {
    name: 'Employment Contract Template',
    description: 'Standard employment contract template for new hires',
    category: 'employment_contract',
    templateContent: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on {{start_date}} between {{company_name}} ("Company") and {{employee_name}} ("Employee").

1. POSITION AND DUTIES
Employee is hired for the position of {{position}} in the {{department}} department. Employee agrees to perform all duties and responsibilities assigned by the Company.

2. COMPENSATION
Employee will receive an annual salary of {{salary}} payable in accordance with Company's standard payroll practices.

3. BENEFITS
Employee is entitled to participate in all benefit programs made available by the Company to its employees, subject to the terms and conditions of such programs.

4. EMPLOYMENT AT WILL
This is an at-will employment relationship. Either party may terminate this agreement at any time, with or without cause, and with or without notice.

5. CONFIDENTIALITY
Employee agrees to maintain the confidentiality of all proprietary information and trade secrets of the Company.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the state where the Company is located.

By signing below, both parties agree to the terms and conditions set forth in this Agreement.

Employee Signature: _________________________    Date: _____________
{{employee_name}}

Company Representative: _________________________    Date: _____________
{{company_representative}}
{{company_representative_title}}`,
    fields: [
      { name: 'employee_name', type: 'text', required: true, placeholder: 'Employee Full Name' },
      { name: 'position', type: 'text', required: true, placeholder: 'Job Position' },
      { name: 'department', type: 'text', required: true, placeholder: 'Department' },
      { name: 'salary', type: 'text', required: true, placeholder: 'Annual Salary' },
      { name: 'start_date', type: 'date', required: true, placeholder: 'Start Date' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'company_representative', type: 'text', required: true, placeholder: 'Company Representative Name' },
      { name: 'company_representative_title', type: 'text', required: true, placeholder: 'Representative Title' }
    ],
    isActive: true
  },
  {
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Standard NDA template for protecting confidential information',
    category: 'nda',
    templateContent: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{agreement_date}} between {{company_name}} ("Company") and {{employee_name}} ("Employee").

1. CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" means any and all non-public, confidential, or proprietary information disclosed by the Company to Employee.

2. OBLIGATIONS
Employee agrees to:
a) Hold all Confidential Information in strict confidence
b) Not disclose Confidential Information to any third parties
c) Use Confidential Information solely for the purpose of employment with the Company
d) Return all Confidential Information upon termination of employment

3. EXCEPTIONS
The obligations set forth above shall not apply to information that:
a) Is or becomes publicly available through no breach of this Agreement
b) Is rightfully received from a third party without breach of any confidentiality obligation
c) Is required to be disclosed by law or court order

4. TERM
This Agreement shall remain in effect for the duration of Employee's employment and for a period of {{duration_years}} years thereafter.

5. REMEDIES
Employee acknowledges that breach of this Agreement would cause irreparable harm to the Company and that monetary damages would be inadequate.

Employee Signature: _________________________    Date: _____________
{{employee_name}}

Company Representative: _________________________    Date: _____________
{{company_representative}}
{{company_representative_title}}`,
    fields: [
      { name: 'employee_name', type: 'text', required: true, placeholder: 'Employee Full Name' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'agreement_date', type: 'date', required: true, placeholder: 'Agreement Date' },
      { name: 'duration_years', type: 'text', required: true, placeholder: 'Duration in Years' },
      { name: 'company_representative', type: 'text', required: true, placeholder: 'Company Representative' },
      { name: 'company_representative_title', type: 'text', required: true, placeholder: 'Representative Title' }
    ],
    isActive: true
  },
  {
    name: 'Employee Handbook Acknowledgment',
    description: 'Acknowledgment form for employee handbook receipt and understanding',
    category: 'handbook_acknowledgment',
    templateContent: `EMPLOYEE HANDBOOK ACKNOWLEDGMENT

I, {{employee_name}}, acknowledge that I have received a copy of the {{company_name}} Employee Handbook dated {{handbook_date}}.

I understand that:

1. HANDBOOK CONTENTS
The Employee Handbook contains important information about the Company's policies, procedures, benefits, and expectations.

2. RESPONSIBILITY TO READ
I am responsible for reading and understanding the contents of the Employee Handbook.

3. POLICY CHANGES
The Company reserves the right to modify, update, or change policies at any time with appropriate notice.

4. QUESTIONS
I understand that if I have questions about any policy or procedure, I should contact the Human Resources department.

5. COMPLIANCE
I agree to comply with all policies and procedures outlined in the Employee Handbook.

6. AT-WILL EMPLOYMENT
I understand that nothing in the Employee Handbook creates an employment contract or changes my at-will employment status.

By signing below, I acknowledge that I have received, read, and understood the Employee Handbook.

Employee Signature: _________________________    Date: _____________
{{employee_name}}

Employee ID: {{employee_id}}
Department: {{department}}
Start Date: {{start_date}}`,
    fields: [
      { name: 'employee_name', type: 'text', required: true, placeholder: 'Employee Full Name' },
      { name: 'employee_id', type: 'text', required: true, placeholder: 'Employee ID' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'department', type: 'text', required: true, placeholder: 'Department' },
      { name: 'start_date', type: 'date', required: true, placeholder: 'Start Date' },
      { name: 'handbook_date', type: 'date', required: true, placeholder: 'Handbook Date' }
    ],
    isActive: true
  },
  {
    name: 'IT Policy Acknowledgment',
    description: 'Acknowledgment of IT policies and acceptable use guidelines',
    category: 'policy_acknowledgment',
    templateContent: `IT POLICY ACKNOWLEDGMENT

I, {{employee_name}}, acknowledge that I have received and reviewed the {{company_name}} Information Technology Policy.

I understand and agree to comply with the following:

1. ACCEPTABLE USE
- Use company IT resources only for business purposes
- Maintain the security and confidentiality of company data
- Not install unauthorized software or hardware
- Report security incidents immediately

2. PASSWORD SECURITY
- Create strong, unique passwords for all accounts
- Not share passwords with others
- Change passwords regularly as required

3. DATA PROTECTION
- Handle confidential information appropriately
- Use encryption when required
- Follow data backup and retention policies
- Not remove company data without authorization

4. INTERNET AND EMAIL USE
- Use internet and email responsibly and professionally
- Not access inappropriate websites or content
- Not send spam or malicious communications
- Understand that usage may be monitored

5. MOBILE DEVICES
- Follow mobile device management policies
- Secure devices with passwords/biometrics
- Report lost or stolen devices immediately
- Separate personal and business use appropriately

6. CONSEQUENCES
I understand that violation of IT policies may result in disciplinary action, up to and including termination of employment.

Employee Signature: _________________________    Date: _____________
{{employee_name}}

Employee ID: {{employee_id}}
Department: {{department}}
Manager: {{manager_name}}`,
    fields: [
      { name: 'employee_name', type: 'text', required: true, placeholder: 'Employee Full Name' },
      { name: 'employee_id', type: 'text', required: true, placeholder: 'Employee ID' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'department', type: 'text', required: true, placeholder: 'Department' },
      { name: 'manager_name', type: 'text', required: true, placeholder: 'Manager Name' }
    ],
    isActive: true
  },
  {
    name: 'Offer Letter Template',
    description: 'Standard offer letter template for job offers',
    category: 'offer_letter',
    templateContent: `JOB OFFER LETTER

{{offer_date}}

{{candidate_name}}
{{candidate_address}}

Dear {{candidate_name}},

We are pleased to offer you the position of {{position}} with {{company_name}}. We believe your skills and experience will be a valuable addition to our team.

POSITION DETAILS:
- Position: {{position}}
- Department: {{department}}
- Reporting Manager: {{manager_name}}
- Start Date: {{start_date}}
- Work Location: {{work_location}}

COMPENSATION AND BENEFITS:
- Annual Salary: {{annual_salary}}
- Payment Schedule: {{payment_schedule}}
- Benefits: {{benefits_summary}}
- Vacation Days: {{vacation_days}} per year
- Probation Period: {{probation_months}} months

EMPLOYMENT TERMS:
- Employment Type: {{employment_type}}
- This offer is contingent upon successful completion of background checks and reference verification
- This is an at-will employment arrangement

Please confirm your acceptance of this offer by signing and returning this letter by {{response_deadline}}. We look forward to welcoming you to our team!

Sincerely,

{{hiring_manager_name}}
{{hiring_manager_title}}
{{company_name}}

---

ACCEPTANCE

I, {{candidate_name}}, accept the terms and conditions of employment as outlined in this offer letter.

Candidate Signature: _________________________    Date: _____________
{{candidate_name}}`,
    fields: [
      { name: 'candidate_name', type: 'text', required: true, placeholder: 'Candidate Full Name' },
      { name: 'candidate_address', type: 'text', required: true, placeholder: 'Candidate Address' },
      { name: 'position', type: 'text', required: true, placeholder: 'Job Position' },
      { name: 'department', type: 'text', required: true, placeholder: 'Department' },
      { name: 'manager_name', type: 'text', required: true, placeholder: 'Reporting Manager' },
      { name: 'start_date', type: 'date', required: true, placeholder: 'Start Date' },
      { name: 'work_location', type: 'text', required: true, placeholder: 'Work Location' },
      { name: 'annual_salary', type: 'text', required: true, placeholder: 'Annual Salary' },
      { name: 'payment_schedule', type: 'text', required: true, placeholder: 'Payment Schedule' },
      { name: 'benefits_summary', type: 'text', required: true, placeholder: 'Benefits Summary' },
      { name: 'vacation_days', type: 'text', required: true, placeholder: 'Vacation Days' },
      { name: 'probation_months', type: 'text', required: true, placeholder: 'Probation Period' },
      { name: 'employment_type', type: 'text', required: true, placeholder: 'Employment Type' },
      { name: 'response_deadline', type: 'date', required: true, placeholder: 'Response Deadline' },
      { name: 'hiring_manager_name', type: 'text', required: true, placeholder: 'Hiring Manager Name' },
      { name: 'hiring_manager_title', type: 'text', required: true, placeholder: 'Hiring Manager Title' },
      { name: 'company_name', type: 'text', required: true, placeholder: 'Company Name' },
      { name: 'offer_date', type: 'date', required: true, placeholder: 'Offer Date' }
    ],
    isActive: true
  }
];

async function seedTemplates() {
  try {
    console.log('🌱 Starting e-signature template seeding...');
    
    // Clear existing templates
    await DocumentTemplate.deleteMany({});
    console.log('🗑️  Cleared existing templates');
    
    // Create a dummy user ID for the createdBy field
    const dummyUserId = new mongoose.Types.ObjectId();
    
    // Add createdBy field to all templates
    const templatesWithCreator = templates.map(template => ({
      ...template,
      createdBy: dummyUserId
    }));
    
    // Insert new templates
    const insertedTemplates = await DocumentTemplate.insertMany(templatesWithCreator);
    
    console.log(`✅ Successfully seeded ${insertedTemplates.length} e-signature templates:`);
    insertedTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`);
    });
    
    console.log('🎉 E-signature template seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding e-signature templates:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedTemplates();
