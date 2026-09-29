# CM Galaxy Signup Journey — Defect & Discrepancy Log

This document logs all functional, UI/UX, validation, and accessibility defects and discrepancies identified during the comprehensive automated and exploratory testing of the **CM Galaxy User Registration / Signup Flow** (`https://platform.inspectron.com/sign-up`).

---

## Defect Summary Dashboard

| Defect ID | Summary | Severity | Priority | Affected Component | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | Trailing whitespace in Yup validation schema for password field error message | Minor | P3 | Password Validation Schema | Reported / Framework Workaround |
| **DEF-002** | Flowbite TextInput applies `text-red-600` error styling to input tag, causing DOM accessibility ambiguity | Minor | P3 | Formik / Flowbite UI Inputs | Reported / Framework Workaround |
| **DEF-003** | Phone input country code prefix (`+1`) cannot be cleared via standard backspace/keyboard input | Minor | P3 | Phone Input (`react-phone-input-2`) | Reported / Handled |
| **DEF-004** | Email error precedence: Generic email validation triggers before character-restriction regex | Trivial | P4 | Email Validation Schema | Reported / Test Data Aligned |
| **DEF-005** | Lack of inline real-time password complexity rule checklist | Minor | P3 | Password Field UI / UX | Suggestion / Enhancement |

---

## Detailed Defect Reports

### DEF-001: Trailing Whitespace in Yup Validation Schema for Password Field Error Message

- **Defect ID**: `DEF-001`
- **Severity**: Minor
- **Priority**: P3
- **Component**: Client-side Yup Validation Schema (`qge` in `index-bundle.js`)
- **Environment**: Chrome 153.0.8010.54 / Windows 11 / Production build `platform.inspectron.com`

#### Description
In the frontend React/Vite client bundle, the Yup validation rule for the password field defines the required error message with an inadvertent trailing space:
```javascript
password: a.string().trim().required("Required password ")
```
While browsers collapse the trailing whitespace during standard HTML rendering (yielding `"Required password"` when queried via `element.getText()`), the raw JSON attribute in Formik error state retains `"Required password "`. This causes strict string assertions or schema contract tests to fail if not sanitized.

#### Steps to Reproduce
1. Navigate to `https://platform.inspectron.com/sign-up`.
2. Click directly into the **Password** field.
3. Click outside (trigger `blur`) or click the **Sign Up** button without entering a password.
4. Inspect the Formik error state or DOM text node.

#### Expected Result
Error message string should be clean and trimmed: `"Required password"`.

#### Actual Result
Schema defines `"Required password "`.

#### Suggested Remediation
In the Yup validation schema (`src/schema/...`), update the string to remove the trailing space:
```javascript
// Before:
password: Yup.string().trim().required("Required password ")

// After:
password: Yup.string().trim().required("Required password")
```

---

### DEF-002: Flowbite TextInput Applies `text-red-600` Error Styling to Input Element, Causing DOM Ambiguity

- **Defect ID**: `DEF-002`
- **Severity**: Minor
- **Priority**: P3
- **Component**: UI Form Inputs (Flowbite React `TextInput`)
- **Environment**: All Supported Browsers (Chrome, Firefox, Edge)

#### Description
When Formik triggers a field validation error, Flowbite React applies `color="failure"`, which dynamically adds the Tailwind CSS utility class `text-red-600` to the `<input>` element itself, while simultaneously rendering an error message below the input inside `<p class="text-red-600">`.
Consequently, standard CSS or XPath selectors targeting error messages (such as `//*[contains(@class,'text-red')]` or `//div[.//input[@id='...']]//*[contains(@class,'text-red')]`) match the `<input>` element rather than the intended `<p>` paragraph element. This can adversely impact automated test locators and assistive technologies (screen readers) that rely on CSS classes for landmark identification.

#### Steps to Reproduce
1. Navigate to `https://platform.inspectron.com/sign-up`.
2. Click **Sign Up** with all fields blank.
3. Inspect DOM for `input#first_name`.
4. Note that `<input id="first_name" class="... text-red-600 ...">` and `<p class="text-red-600">Required first name</p>` both have identical error classes.

#### Expected Result
Error class should be isolated to the `<p>` helper element, or the `<p>` element should feature an explicit attribute such as `role="alert"` or `data-testid="error-message"`.

#### Actual Result
Both `<input>` and `<p>` share `text-red-600`.

#### Framework Workaround Implemented
Framework locators use column-isolated XPath targeting `<p>` tags specifically:
```xpath
//div[contains(@class,'w-full') and .//input[@id='first_name'] and not(.//input[@id='last_name'])]//p[contains(@class,'text-red')]
```

#### Suggested Remediation
Add `role="alert"` and `id="first_name_error"` to the error paragraph, and bind it to the input via `aria-describedby="first_name_error"`.

---

### DEF-003: Phone Input Country Code Prefix (`+1`) Cannot Be Removed via Standard Keyboard Input

- **Defect ID**: `DEF-003`
- **Severity**: Minor
- **Priority**: P3
- **Component**: Phone Input Component (`react-phone-input-2`)
- **Environment**: All Browsers

#### Description
The phone number field defaults to `+1` (United States). If a user attempts to select all (`Ctrl+A`) and press `Backspace` or `Delete` to clear the field completely, the country code prefix `+1` is persistently retained. Users cannot paste an international number formatted with their country code directly into the input; they must manually locate and select their flag from the dropdown widget first.

#### Steps to Reproduce
1. Navigate to `https://platform.inspectron.com/sign-up`.
2. Focus on the Phone Number field.
3. Press `Ctrl+A` then `Backspace`.
4. Note that `+1` remains present in the field.

#### Expected Result
Either standard international copy-paste should auto-detect the country code, or clearing should allow re-entry of `+` and country code.

#### Actual Result
`+1` remains locked in the text box unless changed via flag dropdown.

#### Suggested Remediation
Enable `enableSearch={true}` and `autoFormat={true}` on `react-phone-input-2` to allow seamless international dialing paste and automatic country selection from raw pasted digits.

---

### DEF-004: Email Error Precedence: Generic Format Validation Triggers Before Disallowed Character Error

- **Defect ID**: `DEF-004`
- **Severity**: Trivial
- **Priority**: P4
- **Component**: Email Field Yup Schema
- **Environment**: All Browsers

#### Description
When an invalid email containing disallowed characters or spaces (e.g. `user name@example.com`) is provided, Yup evaluates `.email("Enter a valid Email.")` prior to the regex check `.matches(/^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Only letters (a-z), numbers (0-9), and dots (.) are allowed.")`. As a result, the generic format error takes precedence over the more specific character guidance error for space characters.

#### Steps to Reproduce
1. Navigate to `https://platform.inspectron.com/sign-up`.
2. Enter `user name@example.com` into the Email field.
3. Trigger field blur or click **Sign Up**.

#### Expected Result
User receives specific feedback about disallowed spaces.

#### Actual Result
User receives generic error `"Enter a valid Email."`.

#### Suggested Remediation
Reorder the Yup validation chain or consolidate regex patterns so the user receives specific guidance on disallowed characters regardless of standard email format failure.

---

### DEF-005: Absence of Real-Time Password Complexity Checklist

- **Defect ID**: `DEF-005`
- **Severity**: Minor (UX Enhancement)
- **Priority**: P3
- **Component**: Password Field UX
- **Environment**: All Browsers

#### Description
The registration form requires 5 distinct password criteria:
1. Minimum 8 characters
2. At least one uppercase letter
3. At least one lowercase letter
4. At least one numeric digit
5. At least one special character

Currently, this comprehensive error message is only displayed *after* the user submits the form or blurs the field. There is no active visual checklist (e.g., green checkmarks for fulfilled criteria) as the user types.

#### Suggested Remediation
Add a live interactive password strength meter and requirement checklist under the password field that turns green as each rule is satisfied in real time.
