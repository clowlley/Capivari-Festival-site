export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const onlyDigits = (str: string): string => {
  return str.replace(/\D/g, '');
};

export const formatCPF = (cpf: string): string => {
  const digits = onlyDigits(cpf);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatRG = (rg: string): string => {
  const digits = onlyDigits(rg);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatPhone = (phone: string): string => {
  const digits = onlyDigits(phone);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

/**
 * Formata CPF ou RG baseado no tamanho da string limpa
 */
export const formatCpfRg = (val: string): string => {
  const digits = onlyDigits(val);
  if (digits.length <= 9) {
    return formatRG(digits);
  }
  return formatCPF(digits);
};

export const formatCurrency = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};