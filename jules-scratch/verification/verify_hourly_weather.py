from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:3000")

        # Wait for the map to be ready
        page.wait_for_selector('.gm-style', timeout=30000)

        # Find a paragliding marker (the red 'P') and click it
        # The markers are divs with text 'P'
        marker = page.locator('div').filter(has_text="P").first
        marker.click()

        # Wait for the info window to appear
        info_window = page.locator('.gm-style-iw-c').first
        expect(info_window).to_be_visible()

        # Wait for the hourly weather to load
        expect(page.locator('text="Loading weather data..."')).not_to_be_visible(timeout=30000)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
