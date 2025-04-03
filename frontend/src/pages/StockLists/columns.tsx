import { Stock, StockList, StockOwned } from "@/models/db-models"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
 
export const columns: ColumnDef<StockList>[] = [
  {
    accessorKey: "sl_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
  },
  {
    accessorKey: "performance",
    header: "Performance",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stockList = row.original
 
      return (
        <div className="flex gap-2 justify-end items-center">
          <Link to={`/dashboard/stock-lists/${stockList.sl_id}`}><Button variant="outline" size="sm"> View</Button></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-4 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(stockList.sl_id.toString())}
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export const viewStockListColumns : ColumnDef<StockOwned>[] = [
  {
    accessorKey: "symbol",
    header: "Ticker",
  },
  {
    accessorKey: "price",
    header: "Today's price",
  },
]