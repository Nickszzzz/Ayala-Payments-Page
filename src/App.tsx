"use client";
import { LineWave } from "react-loader-spinner";
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IoIosSearch } from "react-icons/io";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IoCloseCircle } from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";

interface Filters {
  search: string;
  payment_date: string;
  location_name: string;
}

const initialFilters: Filters = {
  search: "",
  payment_date: "",
  location_name: "",
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import columns from "./columns";

import { useState, useEffect } from "react";

const itemsPerPage = 10;

const formatNumber = (amount: any) => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

  return formatted;
};

const PaymentLists = () => {
  let site_url = document.getElementById("site_url") as HTMLElement;
  const site_url_value = site_url as HTMLInputElement;

  let user_id = document.getElementById("current_user_id") as HTMLElement;
  const user_id_value = user_id as HTMLInputElement;

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string>();
  const [totalPaymentRecieved, setTotalPaymentRecieved] = useState<
    number | null
  >();
  const [totalPaymentSales, setTotalPaymentSales] = useState<number | null>();
  const fetchData = async () => {
    try {
      const meetingRooms = await axios.get(
        `${site_url_value.value}/wp-json/v2/admin-payments/${user_id_value.value}`
      );
      setData(meetingRooms.data);
      setTotalItems(meetingRooms.data.length);
    } catch (error) {
      setError("No payments added.");
    }
  };

  useEffect(() => {
    let total: number = 0;
    data.forEach((transaction) => {
      total += parseFloat(transaction.payment_amount);
    });

    let totalSales: number = 0;
    data.forEach((transaction) => {
      if (
        transaction.order_status === "ayala_approved" ||
        transaction.order_status === "cancel_request" ||
        transaction.order_status === "denied_request"
      ) {
        totalSales += parseFloat(transaction.payment_amount);
      }
    });
    setTotalPaymentRecieved(total);
    setTotalPaymentSales(totalSales);
  }, [data]); // Empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    fetchData();
  }, [user_id_value]);

  const resetFilterItem = (itemName: keyof Filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [itemName]: initialFilters[itemName],
    }));
  };

  const handleSearch = () => {
    let newFilters = [
      { id: "location_name", value: filters.location_name },
      {
        id: "payment_date",
        value: filters.payment_date ? filters.payment_date.split(" ")[0] : null,
      },
      // { id: "order_status", value: filters.order_status },
    ];

    setColumnFilters(newFilters);
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [open, setOpen] = useState<boolean>();
  const [filters, setFilters] = useState(initialFilters);
  const [date, setDate] = useState<Date | undefined>();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [uniqueLocationNames, setUniqueLocationNames] = useState<any>();

  useEffect(() => {
    if (data) {
      setUniqueLocationNames(
        table.getRowModel().rows.reduce((uniqueNames, row) => {
          const locationName = row.getValue("location_name");
          // @ts-ignore
          if (!uniqueNames.includes(locationName)) {
            // @ts-ignore
            uniqueNames.push(locationName);
          }
          return uniqueNames;
        }, [])
      );
    }
  }, [data]);

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (table.getState().pagination.pageIndex > 0) {
      table.previousPage();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (table.getState().pagination.pageIndex < totalPages - 1) {
      table.nextPage();
    }
  };

  const convertDate = (inputDate: string): string => {
    const dateObj = new Date(inputDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleDate = (e: any) => {
    setFilters({ ...filters, payment_date: convertDate(e) });
    setDate(e);
    setOpen(false);
  };

  return (
    <main>
      <section className=" h-[15rem] min-h-[20vh] relative">
        <div className="overlay absolute left-0 right-0 top-0 bottom-0 z-10 bg-gray-50"></div>
        <div className="container mx-auto absolute z-20 left-0 right-0 top-0 bottom-0">
          <div className="flex justify-center sm:items-end items-between h-full ">
            <div className="flex flex-col gap-y-6 justify-center sm:justify-start items-center w-full">
              <h1 className=" text-primary font-bold w-full text-center sm:text-left custom-display-lg">
                Payments
              </h1>
              <div className="flex gap-8 flex-col sm:flex-row w-full">
                <div className="flex flex-col gap-2">
                  {data ? (
                    <h4 className="text-primary font-semibold text-2xl lg:custom-display-xs text-center sm:text-left">
                      {formatNumber(totalPaymentRecieved)}
                    </h4>
                  ) : (
                    <Skeleton className="w-full min-w-40 h-[30px] bg-gray-500" />
                  )}
                  <span className="text-dm font-medium text-primary text-center sm:text-left">
                    Total Payments Received
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {data ? (
                    <h4 className="text-primary font-semibold text-2xl lg:custom-display-xs text-center sm:text-left">
                      {formatNumber(totalPaymentSales)}
                    </h4>
                  ) : (
                    <Skeleton className="w-full min-w-40 h-[30px] bg-gray-500" />
                  )}
                  <span className="text-dm font-medium text-primary text-center sm:text-left">
                    Total Sales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className=" bg-gray-50 ">
        <div className="container mx-auto py-14 space-y-2 relative z-20">
          <h2 className="custom-display-xs font-semibold">Payments list</h2>
          <div className="w-full bg-white  rounded-sm border">
            <div className=" grid-cols-1 md:grid md:grid-cols-4 lg:flex lg:flex-nowrap md:flex-nowrap p-4 gap-4 flex justify-between items-center flex-wrap">
              <div className="col-span-1 md:col-span-2 relative flex-grow basis-full md:basis-none">
                <IoIosSearch className="ml-2 h-5 w-5 absolute left-[6px] top-2" />
                <Input
                  tabIndex={-1}
                  placeholder="Search"
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full text-sm text-secondary pl-[2.5rem]"
                />
                {globalFilter && (
                  <IoCloseCircle
                    className="text-red-400 w-4 h-4 absolute right-3 cursor-pointer top-3"
                    onClick={() => {
                      setGlobalFilter("");
                    }}
                  />
                )}
              </div>
              <div className="col-span-1 md:col-span-2  flex-grow basis-full md:basis-none relative">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        `w-full rounded-sm text-sm text-secondary justify-start text-left font-normal`,
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 w-5 h-5 text-black" />
                      {date ? (
                        format(date, "MM-dd-yyyy")
                      ) : (
                        <span>Select Payment Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  {date && (
                    <IoCloseCircle
                      className="text-red-400 w-4 h-4 absolute right-3 cursor-pointer top-3"
                      onClick={() => {
                        setDate(undefined);
                        resetFilterItem("payment_date");
                      }}
                    />
                  )}
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <DropdownMenu>
                <div className="col-span-1 sm:col-span-2  md:col-span-2  justify-between text-sm text-secondary flex-grow basis-full md:basis-none relative">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-sm text-secondary"
                    >
                      {filters.location_name || "Location Name"}
                    </Button>
                  </DropdownMenuTrigger>
                  {filters.location_name && (
                    <IoCloseCircle
                      className="text-red-400 w-4 h-4 absolute right-3 cursor-pointer top-3"
                      onClick={() => {
                        resetFilterItem("location_name");
                      }}
                    />
                  )}
                </div>
                <DropdownMenuContent align="start" className="w-60">
                  {data &&
                    uniqueLocationNames &&
                    uniqueLocationNames.map((row: any) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={row}
                          className="capitalize w-full"
                          onCheckedChange={(value) =>
                            setFilters({ ...filters, location_name: row })
                          }
                        >
                          {row}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="col-span-1 sm:col-span-2 md:col-span-1 flex"
                onClick={() => handleSearch()}
              >
                Search
              </Button>
            </div>
            <div className="rounded-md ">
              {data && (
                <Table>
                  <TableHeader className="bg-gray-200 sticky top-0 z-10">
                    {data &&
                      table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length > 0 || data.length > 0 ? (
                      table.getRowModel().rows?.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            {table.getRowModel().rows?.length > 0
                              ? ""
                              : "No result."}
                          </TableCell>
                        </TableRow>
                      )
                    ) : !error ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <LineWave
                            visible={true}
                            height="100"
                            width="100"
                            color="#4fa94d"
                            ariaLabel="line-wave-loading"
                            wrapperStyle={{}}
                            wrapperClass="flex justify-center items-center h-[200px]"
                            firstLineColor=""
                            middleLineColor=""
                            lastLineColor=""
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="flex items-center gap-4 justify-between space-x-2 p-4 flex-wrap flex-col sm:flex-row">
              <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
                Showing{" "}
                <span className="text-black">
                  {table.getState().pagination.pageIndex * itemsPerPage + 1} -{" "}
                </span>
                <span className="text-black">
                  {table.getFilteredRowModel().rows.length < itemsPerPage
                    ? table.getFilteredRowModel().rows.length
                    : (table.getState().pagination.pageIndex + 1) *
                        itemsPerPage >
                      totalItems
                    ? totalItems
                    : (table.getState().pagination.pageIndex + 1) *
                      itemsPerPage}{" "}
                </span>
                of <span className="text-black">{totalItems}</span>
              </div>
              <Pagination className="w-auto">
                <PaginationContent className="border rounded-sm gap-0">
                  <PaginationItem className="border-r text-gray-500">
                    <PaginationPrevious
                      href="#"
                      onClick={handlePrevious}
                      className={`${
                        table.getState().pagination.pageIndex === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => {
                    return (
                      index < 3 && (
                        <PaginationItem
                          key={index}
                          className={`border-r ${
                            table.getState().pagination.pageIndex === index
                              ? "text-blue-500 bg-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          <PaginationLink
                            href="#"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    );
                  })}
                  {table.getPageCount() > 3 && (
                    <>
                      <PaginationItem className="border-r text-gray-500">
                        <PaginationEllipsis className="h-10 w-10 items-end pb-1" />
                      </PaginationItem>
                      <PaginationItem className="border-r text-gray-500">
                        <PaginationLink
                          href="#"
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem className="border-r text-gray-500">
                    <PaginationNext
                      href="#"
                      onClick={handleNext}
                      className={`${
                        table.getState().pagination.pageIndex >= totalPages - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentLists;
