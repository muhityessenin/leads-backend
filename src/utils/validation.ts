export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validatePaginationParams = (page: number, limit: number) => {
  const validPage = Math.max(1, parseInt(String(page)) || 1);
  const validLimit = Math.max(1, Math.min(100, parseInt(String(limit)) || 10));
  return { page: validPage, limit: validLimit };
};

export default {
  validateEmail,
  validatePhoneNumber,
  validateUrl,
  validateUUID,
  sanitizeInput,
  validatePaginationParams,
};
