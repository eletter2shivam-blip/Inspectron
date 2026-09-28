# CM Galaxy Signup Journey — Test Scenario Matrix

## Overview
This matrix provides comprehensive test scenario coverage for the **CM Galaxy User Registration / Signup Flow** (`https://platform.cmgalaxy.com/sign-up`). It is grounded in the actual application architecture discovered from the live application and its client-side validation rules (Yup schema / Formik implementation).

---

## Priority Definitions
- **P0**: Critical signup path and core functionality (blocker if failed)
- **P1**: Core validation, field constraints, error messaging, and security essentials
- **P2**: Secondary navigation, UI responsiveness, edge cases, and auxiliary flows
- **P3**: Minor cosmetic or low-risk edge validations

---

## 1. Page Access & UI Baseline Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data / Action | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-001** | Verify direct navigation to signup page URL | Navigation / Positive | P0 | Navigate to `https://platform.cmgalaxy.com/sign-up` | URL is `https://platform.cmgalaxy.com/sign-up`; HTTP 200; page loads without fatal script errors | Automated |
| **CM-SIGNUP-002** | Verify page title and brand identity | UI / Positive | P1 | Inspect `document.title` and header branding | Title contains `"CMGALAXY - AI Powered Marketing Platform"`; CM Galaxy logo rendered | Automated |
| **CM-SIGNUP-003** | Verify presence of all Step 1 registration fields | UI / Positive | P0 | Check First Name, Last Name, Phone, Email, Password, Confirm Password | All 6 input fields are visible and interactable | Automated |
| **CM-SIGNUP-004** | Verify field labels and placeholders | UI / Content | P1 | Inspect labels and placeholder attributes | Labels: "First Name", "Last Name", "Phone Number", "Email Address", "Password", "Confirm Password"; Placeholders match specification | Automated |
| **CM-SIGNUP-005** | Verify Step Indicator displays "1. Sign Up", "2. Brand Setup", "3. Brand Configuration" | UI | P2 | Inspect sidebar / top stepper | Stepper displays all three steps with Step 1 active | Automated |
| **CM-SIGNUP-006** | Verify Sign Up submit button is displayed | UI / Positive | P0 | Locate submit button | Button with text "Sign Up" is displayed and styled correctly | Automated |
| **CM-SIGNUP-007** | Verify Login link is displayed on signup page | UI / Navigation | P1 | Inspect "Already have an account? Login" | "Login" link pointing to `/login` is visible | Automated |
| **CM-SIGNUP-008** | Verify Terms & Conditions and Privacy Policy links | UI / Legal | P1 | Inspect disclaimer text and legal hyperlinks | "Terms & Conditions" (`/termsconditions`) and "Privacy Policy" (`/privacypolicy`) open with `target="_blank"` | Automated |
| **CM-SIGNUP-009** | Verify page refresh retains application stability | Stability | P2 | Enter partial data and refresh page | Page reloads cleanly without broken state or console crashes | Automated |
| **CM-SIGNUP-010** | Verify browser Back and Forward navigation | Navigation | P2 | Navigate Login -> Signup -> Back -> Forward | Browser transitions smoothly between `/login` and `/sign-up` | Automated |

---

## 2. First Name Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-011** | Valid alphabetic first name | Positive | P0 | `John` | Accepted; no validation error displayed | Automated |
| **CM-SIGNUP-012** | Valid compound first name with single space | Positive | P1 | `Mary Jane` | Accepted; valid format | Automated |
| **CM-SIGNUP-013** | First name with mixed uppercase and lowercase | Positive | P1 | `McKinley` | Accepted; valid format | Automated |
| **CM-SIGNUP-014** | Empty first name on submit / blur | Negative / Required | P0 | `""` (blur or submit) | Validation error: `"Required first name"` | Automated |
| **CM-SIGNUP-015** | First name containing numbers | Negative | P1 | `John123` | Validation error: `"First name must be alphabetical only."` | Automated |
| **CM-SIGNUP-016** | First name containing special characters | Negative | P1 | `John@Doe!` | Validation error: `"First name must be alphabetical only."` | Automated |
| **CM-SIGNUP-017** | First name containing emoji | Negative | P2 | `John😀` | Validation error: `"First name must be alphabetical only."` | Automated |
| **CM-SIGNUP-018** | First name containing only spaces | Negative | P1 | `"   "` | Validation error: `"Extra space not allowed."` | Automated |
| **CM-SIGNUP-019** | First name with leading whitespace | Negative | P1 | `" John"` | Validation error: `"Extra space not allowed."` | Automated |
| **CM-SIGNUP-020** | First name with trailing whitespace | Negative | P1 | `"John "` | Validation error: `"Extra space not allowed."` | Automated |
| **CM-SIGNUP-021** | First name with consecutive interior spaces | Negative | P1 | `"John  Doe"` | Validation error: `"Extra space not allowed."` | Automated |
| **CM-SIGNUP-022** | First name boundary: exact 30 characters | Boundary | P1 | `A` * 30 | Accepted without error | Automated |
| **CM-SIGNUP-023** | First name boundary: exceeding 30 characters (31 chars) | Boundary / Negative | P1 | `A` * 31 | Validation error: `"Must be 30 characters or less"` | Automated |
| **CM-SIGNUP-024** | First name security: HTML / script tags | Security | P1 | `<script>alert('xss')</script>` | Rejected by alphabetical check; no execution | Automated |
| **CM-SIGNUP-025** | First name security: SQL injection string | Security | P1 | `' OR '1'='1` | Rejected by alphabetical check | Automated |

---

## 3. Last Name Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-026** | Valid alphabetic last name | Positive | P0 | `Smith` | Accepted; no error | Automated |
| **CM-SIGNUP-027** | Valid compound last name with single space | Positive | P1 | `Van Buren` | Accepted; no error | Automated |
| **CM-SIGNUP-028** | Empty last name on submit / blur | Negative / Required | P0 | `""` | Validation error: `"Required last name"` | Automated |
| **CM-SIGNUP-029** | Last name containing numbers | Negative | P1 | `Smith789` | Validation error: `"Last name must be alphabetical only."` | Automated |
| **CM-SIGNUP-030** | Last name containing special characters | Negative | P1 | `Smith#$` | Validation error: `"Last name must be alphabetical only."` | Automated |
| **CM-SIGNUP-031** | Last name with leading or trailing whitespace | Negative | P1 | `" Smith "` | Validation error: `"Extra space not allowed."` | Automated |
| **CM-SIGNUP-032** | Last name boundary: exact 30 characters | Boundary | P1 | `B` * 30 | Accepted without error | Automated |
| **CM-SIGNUP-033** | Last name boundary: 31 characters | Boundary / Negative | P1 | `B` * 31 | Validation error: `"Must be 30 characters or less"` | Automated |

---

## 4. Phone Number Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-034** | Default phone country code | UI / Positive | P1 | Inspect default state | Default country is US (`+1`) with flag icon | Automated |
| **CM-SIGNUP-035** | Valid US phone number (10 digits) | Positive | P0 | `9876543210` | Accepted without error | Automated |
| **CM-SIGNUP-036** | Phone number with minimum digits (6 digits) | Boundary / Positive | P1 | `123456` | Accepted (meets 6-15 digit constraint) | Automated |
| **CM-SIGNUP-037** | Phone number with maximum digits (15 digits) | Boundary / Positive | P1 | `123456789012345` | Accepted (meets 6-15 digit constraint) | Automated |
| **CM-SIGNUP-038** | Phone number too short (< 6 digits) | Negative | P1 | `12345` | Validation error: `"Phone number must be between 6 and 15 digits, including optional country code"` | Automated |
| **CM-SIGNUP-039** | Country dropdown opens and allows search | UI / Dropdown | P2 | Click flag button, type "United Kingdom" | Filtered country option appears and is selectable | Automated |

---

## 5. Email Address Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-040** | Standard valid email address | Positive | P0 | `test.user100@gmail.com` | Accepted without error | Automated |
| **CM-SIGNUP-041** | Uppercase / mixed case email address | Positive | P1 | `Test.User100@Example.COM` | Accepted | Automated |
| **CM-SIGNUP-042** | Email with multiple subdomain levels | Positive | P1 | `alex@corp.sub.example.com` | Accepted | Automated |
| **CM-SIGNUP-043** | Empty email address on submit / blur | Negative / Required | P0 | `""` | Validation error: `"Required Email"` | Automated |
| **CM-SIGNUP-044** | Email missing '@' symbol | Negative | P0 | `usergmail.com` | Validation error: `"Enter a valid Email."` | Automated |
| **CM-SIGNUP-045** | Email missing domain name | Negative | P0 | `user@` | Validation error: `"Enter a valid Email."` | Automated |
| **CM-SIGNUP-046** | Email missing username part | Negative | P0 | `@example.com` | Validation error: `"Enter a valid Email."` | Automated |
| **CM-SIGNUP-047** | Email with disallowed special characters (e.g. `+`, `_`, `%`) | Negative | P1 | `user+tag@example.com` | Validation error: `"Only letters (a-z), numbers (0-9), and dots (.) are allowed."` | Automated |
| **CM-SIGNUP-048** | Email containing space | Negative | P1 | `user name@example.com` | Validation error: `"No spaces are allowed in the Email address."` | Automated |
| **CM-SIGNUP-049** | Duplicate already registered email | Negative / Server | P0 | `test@cmgalaxy.com` | Backend response: `"User already exists!"` or redirects existing user to brand configuration | Automated |

---

## 6. Password Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-050** | Valid password fulfilling all policy criteria | Positive | P0 | `Pass@1234` (8+ chars, upper, lower, num, spec) | Accepted without validation error | Automated |
| **CM-SIGNUP-051** | Empty password on submit / blur | Negative / Required | P0 | `""` | Validation error: `"Required password "` | Automated |
| **CM-SIGNUP-052** | Password less than 8 characters (7 chars) | Boundary / Negative | P0 | `Pass@12` | Validation error: `"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"` | Automated |
| **CM-SIGNUP-053** | Password exact 8 characters (boundary) | Boundary / Positive | P1 | `P@ssw0rd` | Accepted | Automated |
| **CM-SIGNUP-054** | Password missing uppercase letter | Negative | P1 | `pass@1234` | Validation error: `"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"` | Automated |
| **CM-SIGNUP-055** | Password missing lowercase letter | Negative | P1 | `PASS@1234` | Validation error: `"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"` | Automated |
| **CM-SIGNUP-056** | Password missing numeric digit | Negative | P1 | `Password@` | Validation error: `"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"` | Automated |
| **CM-SIGNUP-057** | Password missing special character | Negative | P1 | `Password1234` | Validation error: `"Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"` | Automated |
| **CM-SIGNUP-058** | Password input is masked by default (`type="password"`) | Security | P0 | Inspect DOM `type` attribute | `type="password"` is set | Automated |
| **CM-SIGNUP-059** | Password visibility toggle button toggles `type="text"` | UI / Security | P1 | Click eye toggle button | Input `type` changes to `"text"`; clicking again changes back to `"password"` | Automated |
| **CM-SIGNUP-060** | Password copy/cut/paste prevention | Security | P1 | Trigger paste event | Event is prevented (`onPaste: preventDefault()`) | Automated |

---

## 7. Confirm Password Field Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-061** | Confirm password matches password exactly | Positive | P0 | Password: `Pass@1234`, Confirm: `Pass@1234` | Accepted without error | Automated |
| **CM-SIGNUP-062** | Empty confirm password on submit / blur | Negative / Required | P0 | Password: `Pass@1234`, Confirm: `""` | Validation error: `"Required confirm password"` | Automated |
| **CM-SIGNUP-063** | Confirm password mismatch | Negative | P0 | Password: `Pass@1234`, Confirm: `Pass@9999` | Validation error: `"Passwords must match"` | Automated |
| **CM-SIGNUP-064** | Confirm password case difference | Negative | P1 | Password: `Pass@1234`, Confirm: `pass@1234` | Validation error: `"Passwords must match"` | Automated |
| **CM-SIGNUP-065** | Confirm password with trailing space | Negative | P1 | Password: `Pass@1234`, Confirm: `Pass@1234 ` | Validation error: `"Passwords must match"` | Automated |
| **CM-SIGNUP-066** | Confirm password visibility toggle | UI / Security | P1 | Click eye icon for confirm password | Input `type` changes to `"text"` and back | Automated |

---

## 8. Form Submission, Button States & End-to-End

| Test ID | Scenario Description | Type | Priority | Test Data / Action | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-067** | Submit empty form triggers all required field errors | Negative | P0 | Click "Sign Up" button on blank form | All 6 required error messages appear simultaneously | Automated |
| **CM-SIGNUP-068** | Submit button shows loading state during submission | UI / State | P1 | Submit valid form data | Submit button shows loading spinner (`disabled="true"`) | Automated |
| **CM-SIGNUP-069** | End-to-End Registration initiation with dynamic unique data | Positive / E2E | P0 | Dynamically generated unique email, valid phone, password | Form submits; API `/onboarding/send_verification_code/` called; OTP modal appears | Automated |
| **CM-SIGNUP-070** | OTP Modal displays user email and 4-digit inputs | UI / Flow | P1 | Upon successful initiation | Modal opens with 4 input boxes (`otp0` - `otp3`) | Automated |

---

## 9. Navigation & Responsive Viewport Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data / Viewport | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-071** | Navigate from Signup to Login page | Navigation | P1 | Click "Login" link | URL transitions to `https://platform.cmgalaxy.com/login` | Automated |
| **CM-SIGNUP-072** | Navigate from Login to Signup page | Navigation | P1 | Click "Sign Up" on login page | URL transitions to `https://platform.cmgalaxy.com/sign-up` | Automated |
| **CM-SIGNUP-073** | Open Terms & Conditions in new tab | Legal / Navigation | P2 | Click "Terms & Conditions" link | New tab opens with URL ending in `/termsconditions` | Automated |
| **CM-SIGNUP-074** | Open Privacy Policy in new tab | Legal / Navigation | P2 | Click "Privacy Policy" link | New tab opens with URL ending in `/privacypolicy` | Automated |
| **CM-SIGNUP-075** | Responsive layout: Desktop (1920x1080) | Responsive | P1 | Window size 1920x1080 | Stepper sidebar visible on left, form in main panel, no horizontal scroll | Automated |
| **CM-SIGNUP-076** | Responsive layout: Tablet (768x1024) | Responsive | P2 | Window size 768x1024 | Stepper switches to top layout, inputs stack appropriately | Automated |
| **CM-SIGNUP-077** | Responsive layout: Mobile (375x667) | Responsive | P2 | Window size 375x667 | Clean mobile view, touch targets adequate, form submit accessible | Automated |

---

## 10. Security-Basic Scenarios

| Test ID | Scenario Description | Type | Priority | Test Data / Action | Expected Result | Automation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CM-SIGNUP-078** | Sensitive passwords are masked on screen | Security | P0 | Enter password | Visual bullets displayed, DOM shows `type="password"` | Automated |
| **CM-SIGNUP-079** | Passwords are NEVER written to logs or ExtentReports | Security | P0 | Check logs and reports generated | Password field replaced by `[PROTECTED]` or masked string | Automated |
| **CM-SIGNUP-080** | XSS payload in input fields does not execute script | Security | P1 | `<script>alert(1)</script>` in inputs | Input escaped/rejected; no JavaScript alert triggered | Automated |
