from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Click the first location collapsible to open it
    page.get_by_role("button", name=re.compile(r".* - .*: .*")).first.click()

    # Click the first day collapsible to open it
    page.get_by_role("button", name=re.compile(r"\d{4}-\d{2}-\d{2}: .*")).first.click()

    # Click the first hour collapsible to open it
    page.get_by_role("button", name=re.compile(r"Hour \d{1,2}:00 - .*")).first.click()

    # Wait for the image to be visible
    expect(page.locator("img")).to_be_visible(timeout=10000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
