import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/אילן יוחסין/);
    await expect(
      page.getByRole('heading', { level: 1, name: /משפחת ליבנת|Livnat/i })
    ).toBeVisible();
  });

  test('deep link /he/tree loads explorer shell', async ({ page }) => {
    await page.goto('/he/tree');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat-Zaidman/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole('tab', { name: /עץ|Tree/i })).toBeVisible();
    await expect(page.getByPlaceholder(/חיפוש|Search/i)).toBeVisible();
  });

  test('deep link /he/insights loads', async ({ page }) => {
    await page.goto('/he/insights');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat-Zaidman/i })).toBeVisible({
      timeout: 60_000,
    });
  });

  test('family-graph.json is valid graph payload', async ({ request }) => {
    const res = await request.get('/family-graph.json');
    expect(res.ok(), await res.text()).toBeTruthy();
    const data = (await res.json()) as {
      persons: unknown[];
      families: unknown[];
      rootPersonId: string;
    };
    expect(Array.isArray(data.persons)).toBe(true);
    expect(Array.isArray(data.families)).toBe(true);
    expect(typeof data.rootPersonId).toBe('string');
  });
});
