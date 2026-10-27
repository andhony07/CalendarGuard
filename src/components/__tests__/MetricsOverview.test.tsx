import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsOverview } from '../MetricsOverview';
import { CalendarGuardProvider } from '../../context/CalendarGuardContext';

describe('MetricsOverview component', () => {
  it('renders all four key metrics with calculated values', () => {
    render(
      <CalendarGuardProvider>
        <MetricsOverview />
      </CalendarGuardProvider>
    );

    // Active deadlines metric
    const activeDeadlines = screen.getByTestId('metric-active-deadlines');
    expect(activeDeadlines).toBeInTheDocument();
    expect(parseInt(activeDeadlines.textContent || '0')).toBeGreaterThan(0);

    // High risk metric
    const highRisk = screen.getByTestId('metric-high-risk');
    expect(highRisk).toBeInTheDocument();

    // Overloaded days metric
    const overloadedDays = screen.getByTestId('metric-overloaded-days');
    expect(overloadedDays).toBeInTheDocument();
    expect(parseInt(overloadedDays.textContent || '0')).toBeGreaterThanOrEqual(1);

    // Conflicts metric
    const conflicts = screen.getByTestId('metric-conflicts');
    expect(conflicts).toBeInTheDocument();
    expect(parseInt(conflicts.textContent || '0')).toBeGreaterThanOrEqual(1);
  });
});
