import type { RowWithIdAndName } from "./types/supaorm.types";

export const hasIdAndName = (value: unknown): value is RowWithIdAndName => {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.hasOwnProperty.call(value, "id") &&
    Object.hasOwnProperty.call(value, "name")
  );
};
