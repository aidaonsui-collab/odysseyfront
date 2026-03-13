import DOMPurify from 'dompurify';

// Sanitize user input to prevent XSS
export const sanitizeInput = (input) => {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

// Sanitize HTML content
export const sanitizeHTML = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html);
};

// Validate URL to prevent javascript: URLs
export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Validate coin address (Sui address format)
export const isValidSuiAddress = (address) => {
  // Sui addresses are 64 hex characters (0x + 64 = 66 chars)
  return /^0x[a-fA-F0-9]{64}$/.test(address);
};
