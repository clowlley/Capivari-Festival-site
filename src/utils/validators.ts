import { onlyDigits } from './formatters';

export const validateCPF = (cpf: string): boolean => {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11 || !!digits.match(/(\d)\1{10}/)) return false;
  
  const values = digits.split('').map(el => parseInt(el));
  const getDigit = (num: number) => {
    let sum = 0;
    for (let i = 0; i < num; i++) {
      sum += values[i] * (num + 1 - i);
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return getDigit(9) === values[9] && getDigit(10) === values[10];
};

export const validateRG = (rg: string): boolean => {
  const digits = onlyDigits(rg);
  // Validação simples de tamanho para RG (varia por estado, mas 7-9 é o comum)
  return digits.length >= 7 && digits.length <= 9;
};

export const validateCpfRg = (val: string): boolean => {
  const digits = onlyDigits(val);
  if (digits.length <= 9) return validateRG(digits);
  return validateCPF(digits);
};

export const validatePhone = (phone: string): boolean => {
  const digits = onlyDigits(phone);
  // Aceita (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
  return digits.length >= 10 && digits.length <= 11;
};

export const validateName = (name: string): boolean => {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every(part => part.length >= 2);
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

export const validateRequired = (val: unknown): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'number') return true;
  return !!val;
};