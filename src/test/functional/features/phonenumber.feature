Feature: Phone number

  Scenario: Test Preview Citizen Phone number
    Given Load Citizen phone number
    Then I expect the page to have content "Enter a phone number (optional)"
