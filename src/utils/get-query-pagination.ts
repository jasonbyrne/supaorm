import { QueryPagination } from "../types/query.types";

export const getQueryPagination = (opts?: {
  page?: number;
  perPage?: number;
}): QueryPagination => {
  const page = Math.floor(opts?.page || 1) || 1;
  const perPage = Math.floor(opts?.perPage || 1) || 1;
  const startIndex = (page - 1) * perPage;
  return {
    page,
    perPage,
    startIndex,
    endIndex: startIndex + perPage - 1,
  };
};
