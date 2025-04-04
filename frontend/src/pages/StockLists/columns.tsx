import { Stock, StockList, StockOwned } from "@/models/db-models"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteStockList } from "@/api/stockListApiSlice"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
 
export const stockListColumns: ColumnDef<StockList>[] = [
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

      const queryClient = useQueryClient()
      const {toast} = useToast();
      const [open, setOpen] = useState(false)
      
      const deleteStockListMutation = useMutation({
        mutationFn: deleteStockList,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
        },
      })

      const handleDelete = async () => {
        try {
          const data = await deleteStockListMutation.mutateAsync({
            id: stockList.sl_id 
          });
          console.log("Delete stock list", data);
          toast({
            title: "Delete successful",
            description: `Stock list ${stockList.name} has been successfully deleted.`
          })
        } catch (error: any) {
          console.error(error);
        }
      }
    
 
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
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Delete Stock List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Stock List?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-bold">{stockList.name}</span>?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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