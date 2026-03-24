"use client";

import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const TableContainer = ({
  columns,
  data,
  tableClass,
  theadClass,
  divClass,
  thtrClass,
  trClass,
  thClass,
  tdClass,
  tbodyClass,
  isTfoot = false,
  isPagination = false,
  PaginationClassName,
  SearchPlaceholder = "Search...",
  classStyle = "100%",
  isTableFooter = false,
  isSearch = false,
  isHeader = true,
  isHiddenHeder = false,
  lastTrClass = "",
}) => {
  const [itemsPerPage] = useState(10);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(String(row.getValue(columnId) ?? ""), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getFooterGroups,
    getRowModel,
    getFilteredRowModel: getFilteredRowsModel,
    setPageIndex,
    setPageSize: setTablePageSize,
  } = table;

  useEffect(() => {
    setTablePageSize(pageSize);
    setCurrentPage(1);
    setPageIndex(0);
  }, [pageSize, globalFilter, setTablePageSize, setPageIndex]);

  const filteredRows = getFilteredRowsModel().rows || [];
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setPageIndex(page - 1);
  };

  const showingStartFiltered =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const showingEndFiltered =
    filteredRows.length === 0
      ? 0
      : Math.min(currentPage * pageSize, filteredRows.length);

  return (
    <Fragment>
      {isSearch && (
        <div className="dt-toolbar">
          <div className="dt-length">
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value={data.length || 1}>All</option>
            </select>
            <label> entries per page</label>
          </div>

          <div className="dt-search">
            <label>Search:</label>
            <input
              type="search"
              value={globalFilter}
              className="form-input"
              placeholder={SearchPlaceholder}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className={divClass}>
        <table className={tableClass} style={{ width: classStyle }}>
          {isHeader && !isHiddenHeder && (
            <thead className={theadClass}>
              {getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={thtrClass}>
                  {headerGroup.headers.map((header, cellIndex, cellArray) => {
                    const isSorted = header.column.getIsSorted();
                    const sortIcon =
                      isSorted === "asc" ? "↑" : isSorted === "desc" ? "↓" : "";
                    const isLastCell = cellIndex === cellArray.length - 1;

                    return (
                      <th
                        key={header.id}
                        className={`${header.column.getCanSort() ? "sortable" : ""} ${
                          thClass || ""
                        } ${isLastCell ? lastTrClass : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="dt-th-content">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {isSorted && <span className="dt-sort-icon">{sortIcon}</span>}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          )}

          <tbody className={tbodyClass}>
            {filteredRows.length > 0 ? (
              getRowModel().rows.map((row) => (
                <tr key={row.id} className={trClass}>
                  {row.getVisibleCells().map((cell, cellIndex, cellArray) => {
                    const isLastCell = cellIndex === cellArray.length - 1;

                    return (
                      <td
                        key={cell.id}
                        className={`${tdClass || ""} ${
                          isLastCell ? lastTrClass : ""
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <div className="text-center text-sm text-slate-500">
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {isTfoot && (
            <tfoot>
              {getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => (
                    <th key={footer.id}>
                      {footer.isPlaceholder
                        ? null
                        : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}

          {isTableFooter && (
            <tfoot>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>
                    {typeof col.header === "string" ? col.header : ""}
                  </th>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {isPagination && (
        <div className={`dt-footer ${PaginationClassName || ""}`}>
          <div className="dt-info" role="status">
            {filteredRows.length > 0
              ? `Showing ${showingStartFiltered} to ${showingEndFiltered} of ${filteredRows.length} entries`
              : "No entries found"}
          </div>

          <div className="dt-paging paging_full_numbers">
            <ul className="pagination pagination-primary">
              <li>
                <Link
                  href="#"
                  className={`pagination-item ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
                  }}
                >
                  «
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className={`pagination-item ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                >
                  ‹
                </Link>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page}>
                  <Link
                    href="#"
                    className={`pagination-item ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  href="#"
                  className={`pagination-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                >
                  ›
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className={`pagination-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                >
                  »
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TableContainer;