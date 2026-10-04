import { ContextDetails } from '../types/decision';

export interface Exemplar {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  currentLeaning: string;
  preConfidence: number;
  primaryReasons: string;
  contextDetails: ContextDetails;
  alreadyConsidered: string;
}

export const EXEMPLARS: Exemplar[] = [
  {
    id: 'internship-prompt-case',
    badge: 'Student / Career',
    title: 'Accepting a 6-Month Full-Time Internship During Junior Year',
    tagline: 'Attractive stipend and close commute versus academic disruption and mentorship reality.',
    currentLeaning: 'Leaning heavily toward accepting',
    preConfidence: 80,
    primaryReasons:
      'The stipend is great ($35/hr, which will help with living expenses), the company is only a 15-minute commute from home, and having solid industry experience on my resume will give me a competitive edge.',
    contextDetails: {
      domainOrRole: 'Junior Software Quality / Backend Intern at a regional mid-size logistics tech firm',
      timeframe: '6 months (January through June, overlapping with Spring semester)',
      financials: 'Stipend of $35/hour (~$5,600/month pre-tax)',
      workloadOrHours: 'Full-time, 40 hours/week, in-person 4 days, 1 day remote (8:30 AM - 5:00 PM)',
      locationOrCommute: '15-minute drive from parents’ house',
      academicOrCareerSchedule:
        'Currently in 3rd year Computer Science. Standard spring semester requires 16 credit hours (Algorithms, Operating Systems, Linear Algebra, and a lab). Minimum credits for full-time student status is 12.',
      otherConstraints:
        'Graduation is currently slated for May of next year. Taking leave of absence or dropping below full-time might affect on-campus health insurance and financial aid eligibility.',
    },
    alreadyConsidered:
      'I already know that my social life will take a dip and that I will be tired in the evenings.',
  },
  {
    id: 'startup-vs-corporate',
    badge: 'Tech & Career',
    title: 'Joining a 5-Person Seed Startup as First Engineer vs Staying at a Stable Tech Firm',
    tagline: 'High equity upside and big title versus 9-month runway and zero structured mentorship.',
    currentLeaning: 'Leaning toward joining the startup',
    preConfidence: 75,
    primaryReasons:
      'Founding Engineer title, 1.5% equity grant, total architecture ownership, and rapid 10x learning compared to slow corporate sprint planning.',
    contextDetails: {
      domainOrRole: 'Founding Full-Stack Engineer at an AI dev tools startup',
      timeframe: 'Immediate hire; seed round raised 3 months ago with 9 months of runway remaining',
      financials: '25% pay cut from current corporate base ($115k vs current $155k + RSUs)',
      workloadOrHours: '60+ hours/week expected, frequent weekend deploys and customer calls',
      locationOrCommute: 'Downtown co-working space, 45 minutes commute',
      academicOrCareerSchedule: 'Currently 2 years out of college, single, no dependents',
      otherConstraints: 'Company has not yet reached product-market fit or recurring enterprise revenue.',
    },
    alreadyConsidered:
      'I already know startups are risky and work hours are longer than my current 9-to-5.',
  },
  {
    id: 'relocating-city',
    badge: 'Life & Finance',
    title: 'Relocating to New York City for a 20% Raise at a Prestige Firm',
    tagline: 'Gross salary increase and glamour versus 3x rent inflation, social reboot, and net savings loss.',
    currentLeaning: 'Torn / Undecided',
    preConfidence: 50,
    primaryReasons:
      'Prestige name brand on my CV, exciting cultural lifestyle in Manhattan, and a $25,000 increase in base salary.',
    contextDetails: {
      domainOrRole: 'Associate Marketing Director at a global agency',
      timeframe: 'Move required within 6 weeks',
      financials: 'Base going from $110,000 in Ohio to $135,000 in NYC. Signing bonus $5,000.',
      workloadOrHours: 'Hybrid (3 days in office), unpredictable pitch deadlines',
      locationOrCommute: 'Apartment search in Brooklyn or Queens, estimated 40m subway commute',
      academicOrCareerSchedule: 'Established close friend circle and family within 1 hour in current city',
      otherConstraints: 'Rent in current city is $1,350/mo; NYC average 1BR is $3,600/mo.',
    },
    alreadyConsidered:
      'I know NYC rents and state taxes are much higher than the Midwest.',
  },
  {
    id: 'product-rush-launch',
    badge: 'Product Strategy',
    title: 'Rushing a SaaS Beta Launch Next Week vs Delaying 4 Weeks for Security & Polish',
    tagline: 'First-mover hype and investor demo versus reputational damage and churn from buggy onboarding.',
    currentLeaning: 'Leaning toward launching next week',
    preConfidence: 85,
    primaryReasons:
      'Need to demonstrate momentum to investors before quarterly meeting; competitors are rumored to release similar features soon; need user feedback asap.',
    contextDetails: {
      domainOrRole: 'Solo SaaS Founder / Indie Developer',
      timeframe: 'Target launch date in 6 days on Product Hunt & Hacker News',
      financials: 'Self-funded bootstrapped runway with 4 months left',
      workloadOrHours: 'Working 14-hour days right now to fix remaining core flows',
      locationOrCommute: 'Remote',
      academicOrCareerSchedule: 'Full-time dedication',
      otherConstraints: 'Authentication has no 2FA, data export is untested, mobile responsiveness has layout breaks.',
    },
    alreadyConsidered:
      'I know the product still has small visual bugs.',
  },
];
