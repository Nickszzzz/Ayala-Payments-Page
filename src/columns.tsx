import { ColumnDef } from "@tanstack/react-table";
const padNumber = (number: number, length: number) => {
  return String(number).padStart(length, "0");
};

import { HiMiniChevronUpDown } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { parse, isSameDay } from "date-fns";
interface Payment {
  transaction_id: number;
  room_id: number;
  payment_amount: number;
  order_status: string;
  initial: string;
  location_name: string;
  customer_name: string;
  payment_date: string;
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "transaction_id",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          TRANSACTION ID
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900 `}
        >
          ALO{padNumber(row.getValue("transaction_id"), 6)}
        </div>
      );
    },
  },
  {
    accessorKey: "room_id",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          BOOKING ID
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const initial = row.original.initial;
      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900 `}
        >
          {initial}
          {padNumber(row.getValue("room_id"), 6)}
        </div>
      );
    },
  },
  {
    accessorKey: "payment_amount",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PAYMENT AMOUNT
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue("payment_amount");
      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(Number(amount));

      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900  `}
        >
          {row.original.order_status === "ayala_cancelled" ||
          row.original.order_status === "approved_request" ? (
            <span className=" text-gray-300">
              - <span className="line-through">{formatted}</span>
            </span> // Render nothing if order_status is "ayala_refunded"
          ) : (
            <span>{formatted}</span> // Render the formatted content otherwise
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "location_name",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900 `}
        >
          {row.getValue("location_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900 `}
        >
          {row.getValue("customer_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "payment_date",
    header: ({ column }) => {
      return (
        <Button
          className="p-0 hover:bg-transparent"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Date
          <HiMiniChevronUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;

      const booked_slot = row.getValue("payment_date") as string;
      // Parse the filter date
      const filter_date = parse(filterValue, "yyyy-MM-dd", new Date());

      // Regular expression to match the `MM-dd-yyyy hh:mm a` format
      const dateTimeRegex = /\b\d{2}-\d{2}-\d{4} \d{2}:\d{2} [AP]M\b/;

      if (dateTimeRegex.test(booked_slot)) {
        // Parse the booked_slot date
        const bookedDate = parse(booked_slot, "MM-dd-yyyy hh:mm a", new Date());

        // Check if the dates are the same
        const isSameDate = isSameDay(filter_date, bookedDate);

        return isSameDate;
      } else {
        // Handle cases where the date format is incorrect or not as expected
        return false;
      }
    },
    cell: ({ row }) => {
      return (
        <div
          // @ts-ignore
          className={`capitalize text-xs font-medium text-gray-900 `}
        >
          {row.getValue("payment_date")}
        </div>
      );
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.getValue("payment_date"));
      const dateB = new Date(b.getValue("payment_date"));
      return dateA.getTime() - dateB.getTime();
    },
  },
];

export default columns;
