import { CalendarEvent, Deadline, WorkingHoursConfig } from '../types';

export const DEFAULT_WORKING_CONFIG: WorkingHoursConfig = {
  startHour: 9,  // 9:00 AM
  endHour: 17,   // 5:00 PM (8-hour window)
  workDays: [1, 2, 3, 4, 5], // Monday - Friday
  maxDailyCommitmentHours: 5.0, // > 5 hours scheduled in a day flags an overload
};

export const DEFAULT_ANALYSIS_TIME = '2026-10-26T09:00:00'; // Monday 9:00 AM

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team Sprint Sync',
    type: 'meeting',
    startTime: '2026-10-26T10:00:00',
    endTime: '2026-10-26T11:00:00',
    flexibility: 'fixed',
    description: 'Weekly team kick-off and priority check.',
    location: 'Meet / Room 4A'
  },
  {
    id: 'evt-2',
    title: 'Architecture Working Group',
    type: 'meeting',
    startTime: '2026-10-26T14:00:00',
    endTime: '2026-10-26T15:30:00',
    flexibility: 'flexible',
    description: 'Review of service boundaries and data store schema.',
    location: 'Virtual Conference'
  },
  {
    id: 'evt-3',
    title: 'Client Success Sync',
    type: 'meeting',
    startTime: '2026-10-27T10:00:00',
    endTime: '2026-10-27T11:30:00',
    flexibility: 'fixed',
    description: 'Quarterly review with primary enterprise client account.',
    location: 'Boardroom B'
  },
  {
    id: 'evt-4',
    title: 'Weekly 1-on-1 with Engineering Lead',
    type: 'meeting',
    startTime: '2026-10-27T11:00:00',
    endTime: '2026-10-27T12:00:00',
    flexibility: 'flexible',
    description: 'Career progression, blocking issues, and feedback.',
    location: '1-on-1 Pod'
  }, // OVERLAP with evt-3 (11:00 - 11:30)
  {
    id: 'evt-5',
    title: 'Deep Work: API Spec Drafting',
    type: 'focus',
    startTime: '2026-10-27T14:00:00',
    endTime: '2026-10-27T15:30:00',
    flexibility: 'flexible',
    deadlineId: 'dl-1',
    description: 'Dedicated focus block for migration endpoints.',
  },
  {
    id: 'evt-6',
    title: 'Cross-functional Product Review',
    type: 'meeting',
    startTime: '2026-10-28T09:30:00',
    endTime: '2026-10-28T11:00:00',
    flexibility: 'fixed',
    description: 'Sign-off on sprint release scope and dependencies.',
    location: 'Main Stage Hall'
  },
  {
    id: 'evt-7',
    title: 'Vendor Tech Demo',
    type: 'meeting',
    startTime: '2026-10-28T11:30:00',
    endTime: '2026-10-28T12:30:00',
    flexibility: 'flexible',
    description: 'Observability platform proof-of-concept walkthrough.',
  },
  {
    id: 'evt-8',
    title: 'Executive Quarterly Briefing',
    type: 'meeting',
    startTime: '2026-10-29T09:00:00',
    endTime: '2026-10-29T10:30:00',
    flexibility: 'fixed',
    description: 'Leadership update on annual OKR progress.',
    location: 'Auditorium'
  },
  {
    id: 'evt-9',
    title: 'Infrastructure Cost Optimization',
    type: 'meeting',
    startTime: '2026-10-29T11:00:00',
    endTime: '2026-10-29T12:30:00',
    flexibility: 'fixed',
    description: 'Review of monthly cloud spend and rightsizing recommendations.',
  },
  {
    id: 'evt-10',
    title: 'Partner Integration Sync',
    type: 'meeting',
    startTime: '2026-10-29T13:30:00',
    endTime: '2026-10-29T15:00:00',
    flexibility: 'flexible',
    description: 'Webhook contract alignment with third-party gateway.',
  },
  {
    id: 'evt-11',
    title: 'Design System Alignment',
    type: 'meeting',
    startTime: '2026-10-29T15:30:00',
    endTime: '2026-10-29T17:00:00',
    flexibility: 'flexible',
    description: 'Review updated typography and token scale in Figma.',
  }, // Total Thursday meetings: 1.5 + 1.5 + 1.5 + 1.5 = 6.0 hours (> 5h limit)
  {
    id: 'evt-12',
    title: 'Security Council Audit',
    type: 'meeting',
    startTime: '2026-10-30T10:00:00',
    endTime: '2026-10-30T11:30:00',
    flexibility: 'fixed',
    description: 'SOC2 readiness verification with internal infosec.',
  },
  {
    id: 'evt-13',
    title: 'Weekly Team Demo & Social',
    type: 'meeting',
    startTime: '2026-10-30T15:30:00',
    endTime: '2026-10-30T16:30:00',
    flexibility: 'flexible',
    description: 'Show and tell of deliverables and team shoutouts.',
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'dl-1',
    title: 'API Migration Spec & Deliverable',
    dueDate: '2026-10-28T14:00:00', // Wed 2:00 PM
    estimatedEffortHours: 11.0,
    completed: false,
    priority: 'high',
    category: 'Engineering',
    description: 'Complete OpenAPI 3.1 definitions, deprecation schedule, and backward compatibility testing.'
  },
  {
    id: 'dl-2',
    title: 'Security Compliance Checklist',
    dueDate: '2026-10-29T17:00:00', // Thu 5:00 PM
    estimatedEffortHours: 5.5,
    completed: false,
    priority: 'high',
    category: 'Governance',
    description: 'Finalize encryption key rotation audit, access logs, and vendor security questionnaire.'
  },
  {
    id: 'dl-3',
    title: 'Database Indexing Benchmark',
    dueDate: '2026-10-30T15:00:00', // Fri 3:00 PM
    estimatedEffortHours: 4.0,
    completed: false,
    priority: 'medium',
    category: 'Performance',
    description: 'Measure p99 query latency on hot shards with partitioned b-tree indexes.'
  },
  {
    id: 'dl-4',
    title: 'Q4 Product Roadmap Polish',
    dueDate: '2026-11-03T17:00:00', // Next Tuesday
    estimatedEffortHours: 4.0,
    completed: false,
    priority: 'low',
    category: 'Strategy',
    description: 'Executive slides review and milestone breakdown for engineering sprint planning.'
  },
  {
    id: 'dl-5',
    title: 'Sprint 42 Retrospective Notes',
    dueDate: '2026-10-26T12:00:00', // Mon 12:00 PM
    estimatedEffortHours: 2.0,
    completed: true,
    priority: 'low',
    category: 'Process',
    description: 'Collated action items and retro action owners distributed to team channel.'
  }
];
