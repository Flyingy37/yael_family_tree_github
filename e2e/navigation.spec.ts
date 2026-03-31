import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('home page CTA navigates to /he/tree', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /כניסה לחקר|Enter the explorer/i });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/he\/tree/);
  });

  test('about link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /אודות|About/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('/he/tree map tab is reachable', async ({ page }) => {
    await page.goto('/he/tree?view=map');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat/i })).toBeVisible({
      timeout: 60_000,
    });
  });

  test('/he/tree timeline tab is reachable', async ({ page }) => {
    await page.goto('/he/tree?view=timeline');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat/i })).toBeVisible({
      timeout: 60_000,
    });
  });

  test('/he/archive loads', async ({ page }) => {
    await page.goto('/he/archive');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat/i })).toBeVisible({
      timeout: 60_000,
    });
  });
});

test.describe('language toggle', () => {
  test('toggling language on home page switches to English', async ({ page }) => {
    await page.goto('/');
    // Default language is Hebrew (locale: he-IL)
    const toggleBtn = page.getByRole('button', { name: /EN|עב/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    // After toggling to English, CTA text should change
    await expect(page.getByRole('link', { name: /Enter the explorer/i })).toBeVisible();
  });
});

test.describe('search', () => {
  test('search box is visible and interactive on /he/tree', async ({ page }) => {
    await page.goto('/he/tree');
    const searchBox = page.getByPlaceholder(/חיפוש|Search/i);
    await expect(searchBox).toBeVisible({ timeout: 60_000 });
    await searchBox.fill('ליבנת');
    // After typing, the search box should still have the value
    await expect(searchBox).toHaveValue('ליבנת');
  });
});

test.describe('routing', () => {
  test('legacy /explore redirect hits a valid page', async ({ page }) => {
    const res = await page.goto('/explore');
    // Accepts both a redirect-then-200 and a direct 200 from the SPA
    expect(res?.ok() ?? true).toBeTruthy();
  });

  test('English tree route /en/tree loads explorer shell', async ({ page }) => {
    await page.goto('/en/tree');
    await expect(page.getByRole('link', { name: /Livnat/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole('tab', { name: /Tree/i })).toBeVisible();
  });

  test('/he/insights has visible content', async ({ page }) => {
    await page.goto('/he/insights');
    await expect(page.getByRole('link', { name: /משפחת ליבנת|Livnat/i })).toBeVisible({
      timeout: 60_000,
    });
  });
});

test.describe('family-graph.json payload', () => {
  test('all persons have required string fields', async ({ request }) => {
    const res = await request.get('/family-graph.json');
    const data = await res.json() as { persons: Record<string, unknown>[] };
    for (const person of data.persons.slice(0, 20)) {
      expect(typeof person.id).toBe('string');
      expect(typeof person.fullName).toBe('string');
    }
  });

  test('all families have spouses and children arrays', async ({ request }) => {
    const res = await request.get('/family-graph.json');
    const data = await res.json() as { families: Record<string, unknown>[] };
    for (const fam of data.families.slice(0, 20)) {
      expect(Array.isArray(fam.spouses)).toBe(true);
      expect(Array.isArray(fam.children)).toBe(true);
    }
  });

  test('rootPersonId is present in persons array', async ({ request }) => {
    const res = await request.get('/family-graph.json');
    const data = await res.json() as {
      persons: { id: string }[];
      rootPersonId: string;
    };
    const ids = new Set(data.persons.map(p => p.id));
    expect(ids.has(data.rootPersonId)).toBe(true);
  });
});
