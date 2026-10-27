import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeadlineCard } from '../DeadlineCard';
import { Deadline, RiskAnalysisResult } from '../../types';

describe('DeadlineCard component', () => {
  const mockDeadline: Deadline = {
    id: 'dl-test-card',
    title: 'Security Compliance Audit',
    dueDate: '2026-10-29T17:00:00',
    estimatedEffortHours: 6,
    completed: false,
    category: 'Security',
  };

  const mockRisk: RiskAnalysisResult = {
    deadlineId: 'dl-test-card',
    deadlineTitle: 'Security Compliance Audit',
    score: 72,
    level: 'high',
    isOverdue: false,
    isCompleted: false,
    availablePrepHours: 4.5,
    estimatedEffortHours: 6,
    effortRatio: 1.33,
    overloadedDaysCount: 1,
    conflictsCount: 0,
    riskFactors: ['Tight schedule with 1 overloaded day'],
    summary: 'High risk: requires intervention',
  };

  it('renders title, score, badge, effort, and prep time', () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();

    render(
      <DeadlineCard
        deadline={mockDeadline}
        risk={mockRisk}
        onSelect={onSelect}
        onToggleComplete={onToggle}
      />
    );

    expect(screen.getByText('Security Compliance Audit')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('6h')).toBeInTheDocument();
    expect(screen.getByText('4.5h')).toBeInTheDocument();
  });

  it('triggers onSelect when card is clicked', () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();

    render(
      <DeadlineCard
        deadline={mockDeadline}
        risk={mockRisk}
        onSelect={onSelect}
        onToggleComplete={onToggle}
      />
    );

    fireEvent.click(screen.getByTestId('deadline-card-dl-test-card'));
    expect(onSelect).toHaveBeenCalledWith('dl-test-card');
  });

  it('triggers onToggleComplete when checkbox is clicked', () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();

    render(
      <DeadlineCard
        deadline={mockDeadline}
        risk={mockRisk}
        onSelect={onSelect}
        onToggleComplete={onToggle}
      />
    );

    fireEvent.click(screen.getByTestId('toggle-complete-dl-test-card'));
    expect(onToggle).toHaveBeenCalledWith('dl-test-card');
    expect(onSelect).not.toHaveBeenCalled(); // Stop propagation verified!
  });
});
