from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000", timeout=60000)

    # Wait for the map to load
    page.wait_for_selector('div[aria-label="Map"]')

    # Click the promising filter button
    button = page.locator('button > img[alt="Filter promising sites"]').first
    button.click()

    page.wait_for_selector('div.absolute.top-12.right-0')
    page.screenshot(path="jules-scratch/verification/promising_filter_popup.png")

    # Click the "Tomorrow" button
    page.click('button:text("Tomorrow")')
    page.wait_for_selector('h3:text("Minimum Promising Hours: 4")')
    page.screenshot(path="jules-scratch/verification/promising_filter_tomorrow.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
