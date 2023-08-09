import { QueryPagination } from "../types/query.types";

export const getQueryPagination = (
  page: number,
  perPage: number
): QueryPagination => {
  page = Math.floor(page) || 1;
  perPage = Math.floor(perPage) || 1;
  const startIndex = (page - 1) * perPage;
  return {
    page,
    perPage,
    startIndex,
    endIndex: startIndex + perPage - 1,
  };
};
