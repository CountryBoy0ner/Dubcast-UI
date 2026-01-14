// Playwright E2E tests — run only via `npm run e2e`.
// Guard imports so the Playwright runner isn't loaded during `ng test` (unit runner).
describe.skip('playwright-only: smoke e2e', () => {
	it('skipped by default', () => {
		expect(true).toBeTruthy();
	});
});
