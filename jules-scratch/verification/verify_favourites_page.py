from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/favourites/test")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/favourites_page_initial.png")

    # Click the first "Today" button
    page.get_by_role("button", name="Today").first.click()
    page.screenshot(path="jules-scratch/verification/favourites_page_clicked.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
