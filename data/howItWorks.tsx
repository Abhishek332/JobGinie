import { UserPlus, FileEdit, Users, LineChart } from 'lucide-react';

export const howItWorks = [
  {
    title: 'Personalized Setup',
    description:
      'Tell us about your industry and experience to get tailored recommendations.',
    icon: <UserPlus className="size-8 text-primary" />,
  },
  {
    title: 'Build Your Application',
    description:
      'Generate AI-enhanced resumes and cover letters designed to pass ATS screening.',
    icon: <FileEdit className="size-8 text-primary" />,
  },
  {
    title: 'Ace Your Interviews',
    description:
      'Practice with job-specific mock interviews and get real-time AI feedback to improve.',
    icon: <Users className="size-8 text-primary" />,
  },
  {
    title: 'Measure Your Growth',
    description:
      'Track your progress with data-driven insights and performance analytics.',
    icon: <LineChart className="size-8 text-primary" />,
  },
];
