export const normalizeText = (text) => {
  if (text === null || text === undefined) return '';
  return text.toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric characters
};