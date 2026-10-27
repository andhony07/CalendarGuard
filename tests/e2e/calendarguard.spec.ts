import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('CalendarGuard E2E Verification Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure deterministic starting state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Application loads without fatal errors and displays product identity', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /CalendarGuard/i })).toBeVisible();
    await expect(page.getByText('Workload-aware deadline risk prediction')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('2. Overview metrics are visible and display calculated values', async ({ page }) => {
    await page.goto('/');
    
    // Check 4 overview metric cards
    const activeDeadlines = page.getByTestId('metric-active-deadlines');
    await expect(activeDeadlines).toBeVisible();
    await expect(activeDeadlines).toHaveText(/[1-9]/); // Non-zero active deadlines

    const highRisk = page.getByTestId('metric-high-risk');
    await expect(highRisk).toBeVisible();

    const overloadedDays = page.getByTestId('metric-overloaded-days');
    await expect(overloadedDays).toBeVisible();

    const conflicts = page.getByTestId('metric-conflicts');
    await expect(conflicts).toBeVisible();
  });

  test('3. Weekly calendar displays sample events and overload indicator', async ({ page }) => {
    await page.goto('/');

    // Check specific seeded events
    await expect(page.getByText('Team Sprint Sync')).toBeVisible();
    await expect(page.getByText('Architecture Working Group')).toBeVisible();

    // Check overload indicator for Thursday
    await expect(page.getByText('OVERLOADED (>5h)')).toBeVisible();
  });

  test('4. Previous-week and next-week navigation updates displayed dates', async ({ page }) => {
    await page.goto('/');

    // Initial week should contain Oct 26
    await expect(page.getByTestId('header-week-label')).toContainText('Oct 26');

    // Click Next Week
    await page.getByLabel('Next Week').click();
    await expect(page.getByTestId('header-week-label')).toContainText('Nov 2');

    // Click Previous Week twice to go back
    await page.getByLabel('Previous Week').click();
    await page.getByLabel('Previous Week').click();
    await expect(page.getByTestId('header-week-label')).toContainText('Oct 19');
  });

  test('5. Deadline risk classifications and scores are visible', async ({ page }) => {
    await page.goto('/');

    // API Migration spec is high risk
    const highRiskBadge = page.getByTestId('risk-badge-dl-1');
    await expect(highRiskBadge).toBeVisible();
    await expect(highRiskBadge).toContainText(/High Risk/i);

    // Q4 Roadmap is low risk
    const lowRiskBadge = page.getByTestId('risk-badge-dl-4');
    await expect(lowRiskBadge).toBeVisible();
    await expect(lowRiskBadge).toContainText(/Low Risk/i);
  });

  test('6. Selecting a deadline opens its detail modal with explainable factors', async ({ page }) => {
    await page.goto('/');

    // Click API Migration Spec card
    await page.getByTestId('deadline-card-dl-1').click();

    // Verify detail modal opened
    const modal = page.getByTestId('deadline-detail-panel');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#deadline-detail-title')).toBeVisible();
    await expect(modal.getByText('Explainable Risk Factors')).toBeVisible();
    await expect(modal.getByText('Available Prep', { exact: true })).toBeVisible();

    // Close modal
    await modal.getByLabel('Close dialog').click();
    await expect(modal).not.toBeVisible();
  });

  test('7. Rescheduling recommendations are displayed with explanations and benefits', async ({ page }) => {
    await page.goto('/');

    // Switch to Recommendations tab
    await page.getByRole('button', { name: 'Recommendations' }).click();

    // Verify recommendations heading and cards
    await expect(page.getByRole('heading', { name: 'Workload & Schedule Recommendations' })).toBeVisible();
    await expect(page.getByText(/Resolve Overlap/i)).toBeVisible();
    await expect(page.getByText(/Benefit:/i).first()).toBeVisible();
  });

  test('8. Applying a recommendation updates the schedule and recalculates metrics', async ({ page }) => {
    await page.goto('/');

    // Check initial conflicts count
    const initialConflicts = await page.getByTestId('metric-conflicts').innerText();
    expect(parseInt(initialConflicts)).toBeGreaterThanOrEqual(1);

    // Apply the hero recommendation or navigate to recommendations
    await page.getByRole('button', { name: 'Recommendations' }).click();

    const applyButton = page.getByTestId('apply-rec-btn-rec-conflict-evt-4');
    await expect(applyButton).toBeVisible();
    await applyButton.click();

    // Button updates to Applied state
    await expect(applyButton).toContainText(/Applied/i);
    await expect(page.getByTestId('toast-notification')).toBeVisible();

    // Go back to Dashboard and check conflicts count reduced
    await page.getByRole('button', { name: 'Dashboard' }).click();
    const updatedConflicts = await page.getByTestId('metric-conflicts').innerText();
    expect(parseInt(updatedConflicts)).toBeLessThan(parseInt(initialConflicts));
  });

  test('9. Schedule changes persist after page reload via localStorage', async ({ page }) => {
    await page.goto('/');

    // Apply conflict recommendation
    await page.getByRole('button', { name: 'Recommendations' }).click();
    await page.getByTestId('apply-rec-btn-rec-conflict-evt-4').click();
    await expect(page.getByTestId('apply-rec-btn-rec-conflict-evt-4')).toContainText(/Applied/i);

    // Reload page
    await page.reload();

    // Conflicts metric remains reduced
    await page.getByRole('button', { name: 'Dashboard' }).click();
    const conflicts = await page.getByTestId('metric-conflicts').innerText();
    expect(parseInt(conflicts)).toBe(0);
  });

  test('10. Reset button restores default sample dataset', async ({ page }) => {
    await page.goto('/');

    // Mark dl-1 as complete
    await page.getByTestId('toggle-complete-dl-1').click();
    await expect(page.getByTestId('risk-badge-dl-1')).toContainText(/Completed/i);

    // Click Restore Demo Data in sidebar
    await page.getByRole('button', { name: /Restore Demo Data/i }).click();
    // Click again to confirm
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Verify dl-1 is restored to High Risk active state
    await expect(page.getByTestId('risk-badge-dl-1')).toContainText(/High Risk/i);
  });

  test('11. Mobile viewport does not produce broken layout or horizontal overflow', async ({ page }) => {
    // Set mobile viewport (iPhone 12 / 13 dimensions)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify main components are readable
    await expect(page.getByRole('heading', { name: /CalendarGuard/i })).toBeVisible();
    await expect(page.getByTestId('metric-active-deadlines')).toBeVisible();

    // Verify no horizontal overflow beyond viewport width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(395);
  });

  test('12. Browser console contains no unexpected application errors', async ({ page }) => {
    const errorLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Calendar' }).click();
    await page.getByRole('button', { name: 'Deadline Risks' }).click();
    await page.getByRole('button', { name: 'Recommendations' }).click();
    await page.getByRole('button', { name: 'Working Hours' }).click();
    await page.getByRole('button', { name: 'Dashboard' }).click();

    // Expect zero console errors
    expect(errorLogs).toHaveLength(0);
  });

  test('13. Capture visual artifacts: Dashboard and Deadline Analysis screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const screenshotDir = path.resolve('test-results/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Capture main dashboard
    await page.screenshot({
      path: path.join(screenshotDir, '01_dashboard_overview.png'),
      fullPage: true,
    });

    // Open detail modal for dl-1
    await page.getByTestId('deadline-card-dl-1').click();
    await expect(page.getByTestId('deadline-detail-panel')).toBeVisible();

    // Capture deadline detail modal
    await page.screenshot({
      path: path.join(screenshotDir, '02_deadline_detail_analysis.png'),
    });

    // Close modal
    await page.getByLabel('Close dialog').click();

    // Capture recommendations view
    await page.getByRole('button', { name: 'Recommendations' }).click();
    await page.screenshot({
      path: path.join(screenshotDir, '03_recommendations_action.png'),
      fullPage: true,
    });
  });
});
