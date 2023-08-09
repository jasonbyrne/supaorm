export const hasFields = (value: unknown, ...fieldNames: string[]): boolean => {
  return (
    typeof value === "object" &&
    value !== null &&
    fieldNames.every((fieldName) =>
      Object.hasOwnProperty.call(value, fieldName)
    )
  );
};
