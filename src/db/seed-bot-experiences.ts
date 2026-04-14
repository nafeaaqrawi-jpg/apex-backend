/**
 * Seeds Experience + Education rows for all bot accounts.
 * Run: npm run db:seed-bot-experiences
 */
import { db } from '../lib/db';
import { users, experiences, education } from './schema';
import { eq, like } from 'drizzle-orm';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

interface BotExp {
  email: string;
  exps: {
    company: string;
    role: string;
    employmentType: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    location: string;
    description: string | null;
  }[];
  edu: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
    activities: string | null;
  }[];
}

const botSeeds: BotExp[] = [
  // ── Primary dev-seed bots ──────────────────────────────────────────────────
  {
    email: `sofia.chen${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Stanford Medicine',
        role: 'Research Associate',
        employmentType: 'Full-time',
        startDate: '2025-07',
        endDate: null,
        isCurrent: true,
        location: 'Stanford, CA · On-site',
        description: 'Conducting translational research in global health equity at the Stanford School of Medicine.',
      },
      {
        company: 'UCSF',
        role: 'Clinical Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'San Francisco, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Human Biology',
        startYear: 2021,
        endYear: 2025,
        activities: 'Stanford Global Health Club · Pre-Med Society · Volunteer EMT · Stanford Women in Medicine',
      },
    ],
  },
  {
    email: `emma.walsh${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Brookings Institution',
        role: 'Policy Intern',
        employmentType: 'Internship',
        startDate: '2024-09',
        endDate: null,
        isCurrent: true,
        location: 'Washington, DC · Hybrid',
        description: 'Contributing to economic policy research with a focus on labor markets and fiscal policy.',
      },
      {
        company: 'Harvard Kennedy School',
        role: 'Research Assistant',
        employmentType: 'Part-time',
        startDate: '2023-09',
        endDate: '2024-05',
        isCurrent: false,
        location: 'Cambridge, MA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Harvard University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Economics',
        startYear: 2020,
        endYear: 2024,
        activities: 'Harvard Political Review · Economics Association · Model UN · Women in Public Policy',
      },
    ],
  },
  {
    email: `priya.sharma${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'OpenAI',
        role: 'ML Engineer Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: null,
        isCurrent: true,
        location: 'San Francisco, CA · On-site',
        description: 'Building and evaluating large language model alignment techniques on the safety team.',
      },
      {
        company: 'Stripe',
        role: 'Software Engineer Intern',
        employmentType: 'Internship',
        startDate: '2023-06',
        endDate: '2023-08',
        isCurrent: false,
        location: 'San Francisco, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science & Mathematics',
        startYear: 2021,
        endYear: 2025,
        activities: 'MIT AI Lab · Women in EECS · Math Olympiad Club · Undergrad Research Opportunities Program (UROP)',
      },
    ],
  },
  {
    email: `olivia.bennett${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'ACLU',
        role: 'Legal Policy Intern',
        employmentType: 'Internship',
        startDate: '2024-05',
        endDate: null,
        isCurrent: true,
        location: 'New York, NY · Hybrid',
        description: 'Researching constitutional law issues and drafting policy briefs for the national staff attorneys.',
      },
      {
        company: 'Yale Law School',
        role: 'Research Assistant',
        employmentType: 'Part-time',
        startDate: '2023-01',
        endDate: '2024-05',
        isCurrent: false,
        location: 'New Haven, CT',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Yale University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Political Science',
        startYear: 2020,
        endYear: 2024,
        activities: 'Yale Political Union · Pre-Law Society · Yale Mock Trial · Law Journal Editorial Board',
      },
    ],
  },
  {
    email: `maya.rodriguez${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Columbia University',
        role: 'Behavioral Science Researcher',
        employmentType: 'Full-time',
        startDate: '2024-08',
        endDate: null,
        isCurrent: true,
        location: 'New York, NY · On-site',
        description: 'Leading experiments on decision-making heuristics and behavioral economics in the Decision Lab.',
      },
      {
        company: 'NYU',
        role: 'Research Intern',
        employmentType: 'Internship',
        startDate: '2023-05',
        endDate: '2023-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Columbia University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Psychology',
        startYear: 2019,
        endYear: 2023,
        activities: "Columbia Psychology Society · Behavioral Economics Club · Dean's List · Senior Thesis Research Grant",
      },
    ],
  },
  {
    email: `james.park${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Jane Street',
        role: 'Quantitative Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: null,
        isCurrent: true,
        location: 'New York, NY · On-site',
        description: 'Developing and backtesting systematic trading strategies using statistical and ML methods.',
      },
      {
        company: 'Princeton University',
        role: 'Research Assistant',
        employmentType: 'Part-time',
        startDate: '2023-09',
        endDate: '2024-05',
        isCurrent: false,
        location: 'Princeton, NJ',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Princeton University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Mathematics',
        startYear: 2020,
        endYear: 2024,
        activities: 'Princeton Math Club · Putnam Competition Team · Chess Club · Society of Physics Students',
      },
    ],
  },
  {
    email: `lucas.chen${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Goldman Sachs',
        role: 'Incoming Investment Banking Analyst',
        employmentType: 'Full-time',
        startDate: '2025-07',
        endDate: null,
        isCurrent: true,
        location: 'Chicago, IL · On-site',
        description: 'Joining the Leveraged Finance group in Chicago after completing the Duke finance program.',
      },
      {
        company: 'JPMorgan Chase',
        role: 'Investment Banking Summer Analyst',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Duke University',
        degree: 'Bachelor of Science in Business',
        fieldOfStudy: 'Finance',
        startYear: 2019,
        endYear: 2023,
        activities: 'Duke Investment Club · Finance Society · Interfraternity Council · Economics Honor Society',
      },
    ],
  },
  {
    email: `noah.williams${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Tesla',
        role: 'Mechanical Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: null,
        isCurrent: true,
        location: 'Fremont, CA · On-site',
        description: 'Working on powertrain thermal management systems for next-generation EV platforms.',
      },
      {
        company: 'GE Aerospace',
        role: 'Engineering Intern',
        employmentType: 'Internship',
        startDate: '2023-06',
        endDate: '2023-08',
        isCurrent: false,
        location: 'Evendale, OH',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Cornell University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Mechanical Engineering',
        startYear: 2021,
        endYear: 2025,
        activities: 'Cornell Rocketry Team · ASME · Outdoor Club · Cornell Hiking & Trail Running',
      },
    ],
  },
  {
    email: `aiden.foster${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Kirkland & Ellis',
        role: 'Litigation Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: null,
        isCurrent: true,
        location: 'Chicago, IL · On-site',
        description: 'Supporting senior associates on complex commercial litigation and appellate matters.',
      },
      {
        company: 'Cook County Public Defender',
        role: 'Legal Intern',
        employmentType: 'Internship',
        startDate: '2023-05',
        endDate: '2023-08',
        isCurrent: false,
        location: 'Chicago, IL',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Northwestern University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Philosophy',
        startYear: 2020,
        endYear: 2024,
        activities: 'Northwestern Debate Society · Mock Trial · Pre-Law Society · Phi Beta Kappa',
      },
    ],
  },
  {
    email: `ethan.brooks${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Council on Foreign Relations',
        role: 'Policy Fellow',
        employmentType: 'Full-time',
        startDate: '2024-09',
        endDate: null,
        isCurrent: true,
        location: 'Washington, DC · On-site',
        description: 'Researching transatlantic security policy and contributing to CFR publications and task force reports.',
      },
      {
        company: 'U.S. Department of State',
        role: 'Intern',
        employmentType: 'Internship',
        startDate: '2023-06',
        endDate: '2023-08',
        isCurrent: false,
        location: 'Washington, DC',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Georgetown University',
        degree: 'Bachelor of Science in Foreign Service',
        fieldOfStudy: 'International Relations',
        startYear: 2019,
        endYear: 2023,
        activities: 'SFS Council · Georgetown Debate · Diplomatic History Society · Arabic Language Program',
      },
    ],
  },

  // ── Extra bots ─────────────────────────────────────────────────────────────
  {
    email: `zoe.anderson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'McKinsey & Company',
        role: 'Business Analyst Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Brown University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Psychology',
        startYear: 2021,
        endYear: 2025,
        activities: 'Brown Behavioral Economics Lab · Psychology Society · Varsity Track',
      },
    ],
  },
  {
    email: `lily.park${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'A24',
        role: 'Development Intern',
        employmentType: 'Internship',
        startDate: '2024-05',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'New York University',
        degree: 'Bachelor of Fine Arts',
        fieldOfStudy: 'Film & Television',
        startYear: 2020,
        endYear: 2024,
        activities: 'NYU Film Society · Tisch Writers Room · International Film Society',
      },
    ],
  },
  {
    email: `isabella.torres${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Andreessen Horowitz',
        role: 'VC Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Menlo Park, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'University of Southern California',
        degree: 'Bachelor of Science in Business Administration',
        fieldOfStudy: 'Entrepreneurship',
        startYear: 2020,
        endYear: 2024,
        activities: 'USC Entrepreneurs · Lloyd Greif Center · Startup Garage · USC Business Senate',
      },
    ],
  },
  {
    email: `mia.chen${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Google DeepMind',
        role: 'Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Mountain View, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'California Institute of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Physics',
        startYear: 2022,
        endYear: 2026,
        activities: 'Caltech Quantum Computing Group · Physics Society · Chess Club · SURF Research Program',
      },
    ],
  },
  {
    email: `chloe.kim${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Apple',
        role: 'HCI Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Cupertino, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Carnegie Mellon University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Human-Computer Interaction',
        startYear: 2020,
        endYear: 2024,
        activities: 'CMU Design Club · Women in CS · HCI Institute Student Advisory Board',
      },
    ],
  },
  {
    email: `natalie.brooks${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'United Nations',
        role: 'Programme Assistant Intern',
        employmentType: 'Internship',
        startDate: '2024-01',
        endDate: '2024-05',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Georgetown University',
        degree: 'Bachelor of Science in Foreign Service',
        fieldOfStudy: 'International Relations',
        startYear: 2020,
        endYear: 2024,
        activities: 'SFS Student Council · Georgetown Africa Policy Initiative · Model African Union',
      },
    ],
  },
  {
    email: `layla.scott${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Google',
        role: 'Software Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-05',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Austin, TX',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'The University of Texas at Austin',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2020,
        endYear: 2024,
        activities: 'Texas Convergent · Women in CS · Turing Scholars · ACM Student Chapter',
      },
    ],
  },
  {
    email: `penelope.green${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Bridgewater Associates',
        role: 'Research Analyst Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Westport, CT',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'University of Chicago',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Philosophy',
        startYear: 2021,
        endYear: 2025,
        activities: 'UChicago Philosophy Society · Great Books Program · Logic & Metaphysics Reading Group · Phi Beta Kappa',
      },
    ],
  },
  {
    email: `adelaide.howard${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Morgan Stanley',
        role: 'Investment Banking Summer Analyst',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'University of Pennsylvania',
        degree: 'Bachelor of Science in Economics',
        fieldOfStudy: 'Finance',
        startYear: 2021,
        endYear: 2025,
        activities: 'Wharton Women in Business · Penn Capital Management · Investment Management Club · Varsity Tennis',
      },
    ],
  },
  {
    email: `iris.stewart${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'NASA Jet Propulsion Laboratory',
        role: 'Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Pasadena, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Harvard University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Physics',
        startYear: 2021,
        endYear: 2025,
        activities: 'Harvard Society of Physics Students · Harvard-MIT Mathematics Tournament · Women in STEM',
      },
    ],
  },
  {
    email: `celeste.murphy${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Princeton Neuroscience Institute',
        role: 'Research Assistant',
        employmentType: 'Part-time',
        startDate: '2023-09',
        endDate: null,
        isCurrent: true,
        location: 'Princeton, NJ · On-site',
        description: 'Running EEG experiments on attentional control in the context of consciousness research.',
      },
    ],
    edu: [
      {
        institution: 'Princeton University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Neuroscience',
        startYear: 2021,
        endYear: 2025,
        activities: 'Princeton Neuroscience Club · Women in Science · Psychology Journal Club · Track & Field',
      },
    ],
  },
  {
    email: `liam.cooper${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Paul, Weiss, Rifkind, Wharton & Garrison',
        role: 'Summer Associate',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Harvard University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Government',
        startYear: 2020,
        endYear: 2024,
        activities: 'Harvard Political Review · Harvard Law School Society · Mock Trial · Varsity Track & Field',
      },
    ],
  },
  {
    email: `noah.martinez${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'SpaceX',
        role: 'Physics Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Hawthorne, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Physics',
        startYear: 2021,
        endYear: 2025,
        activities: 'Stanford Physics Society · SLAC National Lab Research · Chess Club · Stanford Symphony Orchestra',
      },
    ],
  },
  {
    email: `mason.thompson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'NVIDIA',
        role: 'Hardware Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Santa Clara, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Electrical Engineering',
        startYear: 2020,
        endYear: 2024,
        activities: 'MIT IEEE Student Chapter · EECS Graduate Research · MIT Cycling Club · Jazz at MIT',
      },
    ],
  },
  {
    email: `oliver.davis${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Goldman Sachs',
        role: 'Investment Management Summer Analyst',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Princeton University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Economics',
        startYear: 2021,
        endYear: 2025,
        activities: 'Princeton Economics Association · Whitman Investment Company · Running Club · Princeton Review',
      },
    ],
  },
  {
    email: `jacob.wilson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'BlackRock',
        role: 'Analyst Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Columbia University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Financial Economics',
        startYear: 2020,
        endYear: 2024,
        activities: 'Columbia Business School Undergraduate Program · Columbia Running Club · Investment Banking Club',
      },
    ],
  },
  {
    email: `james.brown${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Duke University Hospital',
        role: 'Clinical Research Intern',
        employmentType: 'Internship',
        startDate: '2024-05',
        endDate: null,
        isCurrent: true,
        location: 'Durham, NC · On-site',
        description: 'Conducting clinical trials support and patient outcomes research in the oncology department.',
      },
    ],
    edu: [
      {
        institution: 'Duke University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Biology',
        startYear: 2021,
        endYear: 2025,
        activities: 'Duke Pre-Med Society · Duke Basketball Club · Alpha Epsilon Delta · Global Health Alliance',
      },
    ],
  },
  {
    email: `gabriel.young${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Meta',
        role: 'Software Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Menlo Park, CA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Carnegie Mellon University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2021,
        endYear: 2025,
        activities: 'CMU ACM Chapter · Systems Research Group · CMU Basketball Club · Hack CMU',
      },
    ],
  },
  {
    email: `elijah.anderson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Sullivan & Cromwell',
        role: 'Summer Associate',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Yale University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Political Science',
        startYear: 2019,
        endYear: 2023,
        activities: 'Yale Political Union · Yale Debate Association · Pre-Law Society · Mock Trial',
      },
    ],
  },
  {
    email: `henry.jackson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'The New York Times',
        role: 'Editorial Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Northwestern University',
        degree: 'Bachelor of Science in Journalism',
        fieldOfStudy: 'Journalism',
        startYear: 2020,
        endYear: 2024,
        activities: 'Northwestern Medill · Daily Northwestern · Investigative Journalism Club · Society of Professional Journalists',
      },
    ],
  },
  {
    email: `jack.harris${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Boston Consulting Group',
        role: 'Strategy Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Boston, MA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Brown University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Philosophy',
        startYear: 2019,
        endYear: 2023,
        activities: 'Brown Philosophy Society · Socratic Dialogue Club · Pre-Law Society · Varsity Debate',
      },
    ],
  },
  {
    email: `theodore.hill${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Microsoft',
        role: 'Software Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Redmond, WA',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'University of Michigan',
        degree: 'Bachelor of Science in Computer Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2021,
        endYear: 2025,
        activities: 'Michigan AI · MHacks · Entrepreneurship Club · Michigan Data Science Team',
      },
    ],
  },
  {
    email: `caden.taylor${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'U.S. Department of Defense',
        role: 'Policy Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Washington, DC',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'University of Notre Dame',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'International Relations',
        startYear: 2020,
        endYear: 2024,
        activities: 'Notre Dame Model UN · Kellogg Institute · Arabic Language & Culture Club · Varsity Cross Country',
      },
    ],
  },
  {
    email: `declan.walker${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Emory Healthcare',
        role: 'Research Intern',
        employmentType: 'Internship',
        startDate: '2024-05',
        endDate: null,
        isCurrent: true,
        location: 'Atlanta, GA · On-site',
        description: 'Investigating neuroinflammatory biomarkers in the Neurology department under faculty supervision.',
      },
    ],
    edu: [
      {
        institution: 'Emory University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Biology',
        startYear: 2020,
        endYear: 2024,
        activities: 'Emory Pre-Medical Society · Alpha Epsilon Delta · Neuroscience Research Club · Club Soccer',
      },
    ],
  },
  {
    email: `julian.anderson${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'International Monetary Fund',
        role: 'Research Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'Washington, DC',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Georgetown University',
        degree: 'Bachelor of Science in Foreign Service',
        fieldOfStudy: 'Political Economy',
        startYear: 2021,
        endYear: 2025,
        activities: 'Georgetown Economics Society · Walsh School of Foreign Service · Model UN · Georgetown Running Club',
      },
    ],
  },
  {
    email: `wyatt.miller${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'Spotify',
        role: 'Software Engineering Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Rice University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science & Music',
        startYear: 2020,
        endYear: 2024,
        activities: 'Rice Jazz Ensemble · Computer Science Club · Music Technology Lab · Marching Owl Band',
      },
    ],
  },
  {
    email: `carter.moore${BOT_EMAIL_DOMAIN}`,
    exps: [
      {
        company: 'General Atlantic',
        role: 'Private Equity Intern',
        employmentType: 'Internship',
        startDate: '2024-06',
        endDate: '2024-08',
        isCurrent: false,
        location: 'New York, NY',
        description: null,
      },
    ],
    edu: [
      {
        institution: 'Washington University in St. Louis',
        degree: 'Bachelor of Science in Business Administration',
        fieldOfStudy: 'Finance',
        startYear: 2019,
        endYear: 2023,
        activities: 'Olin Investment Fund · WashU Entrepreneurship · Finance Society · Club Golf',
      },
    ],
  },
];

async function main() {
  // Get all bot users in one query
  const botUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(like(users.email, `%${BOT_EMAIL_DOMAIN}`));

  const emailToId = Object.fromEntries(botUsers.map((u) => [u.email, u.id]));

  let seeded = 0;
  let skipped = 0;

  for (const seed of botSeeds) {
    const userId = emailToId[seed.email];
    if (!userId) {
      console.warn(`  ⚠ Bot not found: ${seed.email}`);
      skipped++;
      continue;
    }

    // Clear existing
    await db.delete(experiences).where(eq(experiences.userId, userId));
    await db.delete(education).where(eq(education.userId, userId));

    // Insert experiences
    if (seed.exps.length > 0) {
      await db.insert(experiences).values(
        seed.exps.map((exp, i) => ({
          userId,
          ...exp,
          displayOrder: i,
        }))
      );
    }

    // Insert education
    if (seed.edu.length > 0) {
      await db.insert(education).values(
        seed.edu.map((edu, i) => ({
          userId,
          ...edu,
          displayOrder: i,
        }))
      );
    }

    console.log(`  ✓ ${seed.email}`);
    seeded++;
  }

  console.log(`\nDone. Seeded: ${seeded}, Skipped (not found): ${skipped}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
