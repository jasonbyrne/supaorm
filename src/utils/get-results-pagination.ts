import { QueryPagination } from "../types/supaorm.types";

export const getResultsPagination = (
  queryPagination: QueryPagination,
  totalRows = 0
) => {
  const numberOfPages = Math.max(
    Math.ceil(totalRows / queryPagination.perPage),
    1
  );
  return {
    ...queryPagination,
    totalRows,
    numberOfPages,
    isNextPage: queryPagination.page < numberOfPages,
    isPrevPage: queryPagination.page > 1,
  };
};
