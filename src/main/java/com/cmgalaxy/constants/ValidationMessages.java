package com.cmgalaxy.constants;

public final class ValidationMessages {

    private ValidationMessages() {
        // Prevent instantiation
    }

    // First Name
    public static final String REQUIRED_FIRST_NAME = "Required first name";
    public static final String FIRST_NAME_ALPHABETICAL = "First name must be alphabetical only.";
    public static final String FIRST_NAME_EXTRA_SPACE = "Extra space not allowed.";
    public static final String FIRST_NAME_MAX_LENGTH = "Must be 30 characters or less";

    // Last Name
    public static final String REQUIRED_LAST_NAME = "Required last name";
    public static final String LAST_NAME_ALPHABETICAL = "Last name must be alphabetical only.";
    public static final String LAST_NAME_EXTRA_SPACE = "Extra space not allowed.";
    public static final String LAST_NAME_MAX_LENGTH = "Must be 30 characters or less";

    // Phone Number
    public static final String PHONE_DIGITS_RANGE = "Phone number must be between 6 and 15 digits, including optional country code";

    // Email
    public static final String REQUIRED_EMAIL = "Required Email";
    public static final String INVALID_EMAIL = "Enter a valid Email.";
    public static final String EMAIL_ALLOWED_CHARS = "Only letters (a-z), numbers (0-9), and dots (.) are allowed.";
    public static final String EMAIL_NO_SPACES = "No spaces are allowed in the Email address.";

    // Password (trimmed by DOM text representation)
    public static final String REQUIRED_PASSWORD = "Required password";
    public static final String PASSWORD_COMPLEXITY = "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character";

    // Confirm Password
    public static final String REQUIRED_CONFIRM_PASSWORD = "Required confirm password";
    public static final String PASSWORDS_MUST_MATCH = "Passwords must match";

    // Server-side
    public static final String USER_ALREADY_EXISTS = "User already exists!";
    public static final String OTP_VERIFICATION_SUCCESS = "OTP verified successfully!";
}
