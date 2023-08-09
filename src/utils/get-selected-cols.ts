export const getSelectedCols = <T>(select?: string | T[]) => {
  return Array.isArray(select) ? select.join(", ") : select || "*";
};
