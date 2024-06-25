export const STATUS_MESSAGES = {
  // Success Messages
  SUCCESS: 'Operation completed successfully.',
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',

  // Error Messages
  BAD_REQUEST: 'Invalid request. Please check the input data.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource could not be found.',
  SERVER_ERROR: 'An unexpected error occurred on the server.',
  CONFLICT: 'The request could not be completed due to a conflict.',
  EXTERNAL_API_ERROR: 'External API Error',
  DUPLICATE_REQUEST: 'Duplicate request.',

  // Validation Messages
  VALIDATION_ERROR: 'Validation Error',
  MISSING_FIELD: 'Required field is missing.',

  // Authentication and Authorization Messages
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  TOKEN_EXPIRED: 'The token has expired.',
  TOKEN_INVALID: 'The token is invalid.',
  PROVIDE_ACCESS_TOKEN: 'Authorization code is missing.',

  INVALID_ID_FORMAT: 'Invalid ID format',
};

export default STATUS_MESSAGES;
