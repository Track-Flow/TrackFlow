// Mock data for TrackFlow — university MSS context
// Replace with real API calls as backend comes online

export const tfDepartments = [
  { id: 'it',    name: 'IT Support',       color: '#2ec8ff', manager: 7 },
  { id: 'fac',   name: 'Facilities',       color: '#ffb547', manager: 7 },
  { id: 'admin', name: 'Administration',   color: '#c084fc', manager: 7 },
  { id: 'lib',   name: 'Library Services', color: '#2bd48f', manager: 7 },
];

export const tfUsers = [
  { id: 1,  name: 'Lerato Mbeki',          role: 'tla',            dept: 'it',    color: '#2ec8ff', initials: 'LM' },
  { id: 2,  name: 'Sanele Dlamini',        role: 'tla',            dept: 'fac',   color: '#ffb547', initials: 'SD' },
  { id: 3,  name: 'Nadia Fisher',          role: 'tla',            dept: 'it',    color: '#2bd48f', initials: 'NF' },
  { id: 4,  name: 'Kabelo Sithole',        role: 'tla',            dept: 'admin', color: '#c084fc', initials: 'KS' },
  { id: 5,  name: 'Aisha Patel',           role: 'tla',            dept: 'lib',   color: '#ff6b6b', initials: 'AP' },
  { id: 6,  name: 'Marco Rossi',           role: 'tla',            dept: 'it',    color: '#6fdcff', initials: 'MR' },
  { id: 7,  name: 'Dr. Priya Naidoo',      role: 'mss_manager',    dept: null,    color: '#ff9bd0', initials: 'PN' },
  { id: 8,  name: 'Tariq Adams',           role: 'helpdesk_admin', dept: null,    color: '#8fe7ff', initials: 'TA' },
  { id: 9,  name: 'Thando Khumalo (You)',  role: 'end_user',       dept: null,    sub: 'Student · BSc CS, 3rd yr', color: '#6fdcff', initials: 'TK' },
  { id: 10, name: 'Prof. James Okonkwo',   role: 'end_user',       dept: null,    sub: 'Lecturer · School of EIE', color: '#ffb547', initials: 'JO' },
  { id: 11, name: 'Devon Naidoo',          role: 'end_user',       dept: null,    sub: 'Student · BSc IT, 2nd yr',  color: '#c084fc', initials: 'DN' },
  { id: 12, name: 'Busi Moeketsi',         role: 'end_user',       dept: null,    sub: 'Postgrad · MSc Eng',        color: '#2bd48f', initials: 'BM' },
];

export const tfCategories = ['IT Support', 'Facilities', 'Administration', 'Library Services', 'Other'];

export const tfPriorities = [
  { key: 'urgent', label: 'Urgent', color: '#ff6b6b' },
  { key: 'high',   label: 'High',   color: '#ffb547' },
  { key: 'medium', label: 'Medium', color: '#6fdcff' },
  { key: 'low',    label: 'Low',    color: '#8fa2c0' },
];

export const tfStatuses = [
  { key: 'unrouted',    label: 'Unrouted',    color: '#ff9bd0' },
  { key: 'open',        label: 'Open',        color: '#2ec8ff' },
  { key: 'in_progress', label: 'In Progress', color: '#ffb547' },
  { key: 'pending',     label: 'Pending',     color: '#c084fc' },
  { key: 'resolved',    label: 'Resolved',    color: '#2bd48f' },
  { key: 'closed',      label: 'Closed',      color: '#8fa2c0' },
];

export const tfTickets = [
  { id: 'TF-1042', subject: 'VPN disconnecting every 15 minutes',  requesterId: 9,  category: 'IT Support',      dept: 'it',    priority: 'high',   status: 'in_progress', assignee: 1,    created: '2026-04-19 09:12', updated: '2h ago',  attachments: 2, comments: 7, sla: { breach: false, hoursLeft: 6  }, linkedTask: 'KB-32' },
  { id: 'TF-1041', subject: 'Cannot access Sakai course page',      requesterId: 11, category: 'IT Support',      dept: 'it',    priority: 'medium', status: 'open',        assignee: 3,    created: '2026-04-19 07:45', updated: '4h ago',  attachments: 0, comments: 2, sla: { breach: false, hoursLeft: 18 } },
  { id: 'TF-1040', subject: 'Lecture hall projector flickering',    requesterId: 10, category: 'IT Support',      dept: 'it',    priority: 'high',   status: 'open',        assignee: 6,    created: '2026-04-19 08:20', updated: '3h ago',  attachments: 1, comments: 0, sla: { breach: true,  hoursLeft: -2 } },
  { id: 'TF-1038', subject: 'Printer on 3rd floor jammed',          requesterId: 12, category: 'Facilities',      dept: 'fac',   priority: 'low',    status: 'pending',     assignee: 2,    created: '2026-04-18 16:02', updated: '1d ago',  attachments: 1, comments: 1, sla: { breach: false, hoursLeft: 30 } },
  { id: 'TF-1037', subject: 'Library wing aircon broken',           requesterId: 9,  category: 'Facilities',      dept: 'fac',   priority: 'medium', status: 'in_progress', assignee: 2,    created: '2026-04-18 14:00', updated: '8h ago',  attachments: 0, comments: 3, sla: { breach: false, hoursLeft: 14 } },
  { id: 'TF-1036', subject: 'Board meeting minutes — upload',       requesterId: 10, category: 'Administration',  dept: 'admin', priority: 'medium', status: 'in_progress', assignee: 4,    created: '2026-04-18 11:24', updated: '6h ago',  attachments: 3, comments: 5, sla: { breach: false, hoursLeft: 22 } },
  { id: 'TF-1035', subject: 'Locked out of student email',          requesterId: 11, category: 'IT Support',      dept: 'it',    priority: 'urgent', status: 'open',        assignee: null, created: '2026-04-19 10:58', updated: '18m ago', attachments: 0, comments: 0, sla: { breach: false, hoursLeft: 1  } },
  { id: 'TF-1034', subject: 'Lost student card — replacement?',     requesterId: 9,  category: 'Other',           dept: null,    priority: 'medium', status: 'unrouted',    assignee: null, created: '2026-04-19 09:40', updated: '1h ago',  attachments: 0, comments: 0, sla: { breach: false, hoursLeft: 23 }, needsRouting: true },
  { id: 'TF-1033', subject: 'Library e-resource access expired',    requesterId: 10, category: 'Library Services', dept: 'lib',  priority: 'medium', status: 'open',        assignee: 5,    created: '2026-04-18 08:30', updated: '1d ago',  attachments: 0, comments: 1, sla: { breach: false, hoursLeft: 12 } },
  { id: 'TF-1029', subject: 'Wi-Fi dead spots in Wartenweiler',     requesterId: 12, category: 'IT Support',      dept: 'it',    priority: 'high',   status: 'resolved',    assignee: 1,    created: '2026-04-16 14:11', updated: '2d ago',  attachments: 4, comments: 9, sla: { breach: false, hoursLeft: 0  }, linkedTask: 'KB-28' },
  { id: 'TF-1024', subject: 'Add me to PG cohort mailing list',     requesterId: 12, category: 'Administration',  dept: 'admin', priority: 'low',    status: 'closed',      assignee: 4,    created: '2026-04-15 09:00', updated: '4d ago',  attachments: 0, comments: 2, sla: { breach: false, hoursLeft: 0  } },
];

export const tfBoardColumns = [
  { key: 'todo',        title: 'To Do',       color: '#8fa2c0' },
  { key: 'in_progress', title: 'In Progress', color: '#ffb547' },
  { key: 'review',      title: 'Review',      color: '#c084fc' },
  { key: 'done',        title: 'Done',        color: '#2bd48f' },
];

export const tfTasks = [
  { id: 'TF-1035', column: 'todo',        title: 'Locked out of student email',        requesterId: 11, priority: 'urgent', assignees: [1], due: 'Today',   comments: 0, attachments: 0, checklistDone: 0, checklistTotal: 3 },
  { id: 'TF-1041', column: 'todo',        title: 'Cannot access Sakai course page',    requesterId: 11, priority: 'medium', assignees: [3], due: 'Apr 26', comments: 2, attachments: 0, checklistDone: 0, checklistTotal: 4 },
  { id: 'TF-1042', column: 'in_progress', title: 'VPN disconnecting every 15 minutes', requesterId: 9,  priority: 'high',   assignees: [1], due: 'Today',   comments: 7, attachments: 2, checklistDone: 3, checklistTotal: 5, cover: 'band' },
  { id: 'TF-1040', column: 'in_progress', title: 'Lecture hall projector flickering',  requesterId: 10, priority: 'high',   assignees: [6], due: 'Overdue', comments: 0, attachments: 1, checklistDone: 1, checklistTotal: 4 },
  { id: 'TF-1029', column: 'review',      title: 'Wi-Fi dead spots in Wartenweiler',   requesterId: 12, priority: 'high',   assignees: [1], due: 'Apr 24', comments: 9, attachments: 4, checklistDone: 5, checklistTotal: 5 },
  { id: 'KB-28',   column: 'review',      title: 'Document password-reset self-service', requesterId: null, priority: 'medium', assignees: [3], due: '—', comments: 1, attachments: 0, checklistDone: 3, checklistTotal: 3, internal: true },
  { id: 'TF-1019', column: 'done',        title: 'Eduroam config for new MacBooks',    requesterId: 9,  priority: 'medium', assignees: [6], due: 'Apr 18', comments: 4, attachments: 1, checklistDone: 4, checklistTotal: 4 },
  { id: 'TF-1015', column: 'done',        title: 'Lab PC reimage — DH204 row 3',       requesterId: 10, priority: 'low',    assignees: [1], due: 'Apr 17', comments: 2, attachments: 0, checklistDone: 3, checklistTotal: 3 },
];

export const tfActivity = [
  { kind: 'created',  who: 9,  text: 'created ticket TF-1035 · Locked out of student email', when: '18m ago' },
  { kind: 'route',    who: 8,  text: 'routed TF-1034 · "Other" → Administration',            when: '24m ago' },
  { kind: 'status',   who: 1,  text: 'moved TF-1042 to In Progress',                         when: '2h ago'  },
  { kind: 'comment',  who: 2,  text: 'commented on TF-1038: "Parts ordered, ETA Thu."',      when: '38m ago' },
  { kind: 'assigned', who: 3,  text: 'was assigned TF-1041',                                 when: '4h ago'  },
  { kind: 'resolved', who: 1,  text: 'resolved TF-1029 · Wi-Fi dead spots in Wartenweiler',  when: '2d ago'  },
];

export const tfTrend = [
  { d: 'Apr 6', open: 12, resolved: 8  },
  { d: 'Apr 7', open: 15, resolved: 11 },
  { d: 'Apr 8', open: 9,  resolved: 14 },
  { d: 'Apr 9', open: 18, resolved: 10 },
  { d: 'Apr 10', open: 22, resolved: 16 },
  { d: 'Apr 11', open: 14, resolved: 18 },
  { d: 'Apr 12', open: 11, resolved: 15 },
  { d: 'Apr 13', open: 19, resolved: 13 },
  { d: 'Apr 14', open: 25, resolved: 20 },
  { d: 'Apr 15', open: 17, resolved: 22 },
  { d: 'Apr 16', open: 21, resolved: 19 },
  { d: 'Apr 17', open: 23, resolved: 17 },
  { d: 'Apr 18', open: 16, resolved: 21 },
  { d: 'Apr 19', open: 28, resolved: 12 },
];

export const tfSlaCompliance = [
  { dept: 'it',    target: 90, actual: 87 },
  { dept: 'fac',   target: 85, actual: 91 },
  { dept: 'admin', target: 80, actual: 94 },
  { dept: 'lib',   target: 85, actual: 82 },
];

export const tfTlaWorkload = [
  { userId: 1, active: 4, resolvedWk: 12, sla: 87 },
  { userId: 3, active: 2, resolvedWk: 9,  sla: 92 },
  { userId: 6, active: 3, resolvedWk: 8,  sla: 79 },
  { userId: 2, active: 2, resolvedWk: 11, sla: 95 },
  { userId: 4, active: 3, resolvedWk: 7,  sla: 88 },
  { userId: 5, active: 1, resolvedWk: 6,  sla: 100 },
];

export const tfDeptLoad = tfDepartments.map(d => {
  const t = tfTickets.filter(x => x.dept === d.id);
  return {
    ...d,
    open:     t.filter(x => ['open', 'in_progress', 'pending'].includes(x.status)).length,
    resolved: t.filter(x => ['resolved', 'closed'].includes(x.status)).length,
    breach:   t.filter(x => x.sla?.breach).length,
    tlas:     tfUsers.filter(u => u.role === 'tla' && u.dept === d.id).map(u => u.id),
  };
});

export const tfAccessRequests = [
  { id: 1, user: 'Yusuf Hendricks', request: 'Promote to TLA — IT Support', dept: 'IT Support', when: '2h ago',  status: 'pending'  },
  { id: 2, user: 'Zanele Mokoena',  request: 'Promote to TLA — Facilities',  dept: 'Facilities', when: '5h ago',  status: 'pending'  },
  { id: 3, user: 'Sipho Dube',      request: 'Promote to TLA — Admin',       dept: 'Admin',      when: '1d ago',  status: 'approved' },
];