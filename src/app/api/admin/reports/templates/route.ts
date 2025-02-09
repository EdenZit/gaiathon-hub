import { NextResponse } from 'next/server';
import { adminMiddleware } from '@/middleware/adminMiddleware';

// Define available report templates
const reportTemplates = [
  {
    id: 'user-activity',
    name: 'User Activity Report',
    type: 'user',
    description: 'Detailed report of user logins, actions, and engagement metrics',
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Report',
    type: 'team',
    description: 'Analysis of team interactions, document sharing, and communication patterns',
  },
  {
    id: 'system-performance',
    name: 'System Performance Report',
    type: 'performance',
    description: 'System metrics including response times, error rates, and resource usage',
  },
  {
    id: 'user-growth',
    name: 'User Growth Report',
    type: 'user',
    description: 'User registration trends, retention rates, and demographic analysis',
  },
  {
    id: 'team-productivity',
    name: 'Team Productivity Report',
    type: 'team',
    description: 'Team productivity metrics, task completion rates, and milestone tracking',
  },
  {
    id: 'security-audit',
    name: 'Security Audit Report',
    type: 'activity',
    description: 'Security-related events, access patterns, and potential vulnerabilities',
  },
];

export async function GET() {
  try {
    return NextResponse.json({ templates: reportTemplates });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report templates' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 