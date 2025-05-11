import { Stock, StockList, StockOwned, StockOwnedWithData } from "@/models/db-models"
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
import { deleteStockList, toggleVisibility, updateStockList } from "@/api/stockListApiSlice"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
 
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
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    accessorKey: "performance_year",
    header: "Performance (YTD)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_year")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stockList = row.original

      const queryClient = useQueryClient()
      const {toast} = useToast();
      const [open, setOpen] = useState(false)
      const [openRename, setOpenRename] = useState(false)
      const [openVisibility, setOpenVisibility] = useState(false)
      const [newName, setNewName] = useState("")
      const [isPublic, setIsPublic] = useState(stockList.visibility === 'public')
      
      const deleteStockListMutation = useMutation({
        mutationFn: deleteStockList,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
        },
      })
      const updateStockListMutation = useMutation({
        mutationFn: updateStockList,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
        },
      })
      const updateVisibilityMutation = useMutation({
        mutationFn: toggleVisibility,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
          queryClient.invalidateQueries({ queryKey: ['public-stock-lists'] })
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

      const handleRename = async () => {
        try {
          const data = await updateStockListMutation.mutateAsync({
            id: stockList.sl_id ,
            body: {
              name: newName
            }
          });
          console.log("Rename stock list", data);
          toast({
            description: `Stock list ID ${stockList.sl_id} has been successfully renamed to ${newName}.`
          })
        } catch (error: any) {
          console.error(error);
        }
      }

      
      const handleChangeVisibility = async () => {
        try {
          const data = await updateVisibilityMutation.mutateAsync(stockList.sl_id.toString());
          console.log("Visibility", data);
          toast({
            description: `Visibility changed successfully.`
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
              <DropdownMenuItem onClick={() => setOpenRename(true)}>
                Rename Stock List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenVisibility(true)}>
                Edit visibility
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

          <Dialog open={openRename} onOpenChange={setOpenRename}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Stock List</DialogTitle>
                <DialogDescription>
                  You are renaming stock list {stockList.name}
                </DialogDescription>
              </DialogHeader>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)}/>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm" onClick={handleRename}>
                    Save
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openVisibility} onOpenChange={setOpenVisibility}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock list visibility</DialogTitle>
              </DialogHeader>
              <div>
                <Label>Set to public:</Label>
                <Switch checked={isPublic} onCheckedChange={() => setIsPublic(prev => !prev)}/>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm" onClick={handleChangeVisibility}>
                    Save
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

export const getViewStockListColumns = (
  id: string,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"]
): ColumnDef<StockOwnedWithData>[] => [
  {
    accessorKey: "symbol",
    header: "Ticker",
    cell: ({ row }) => {
      const symbol: string = row.getValue("symbol")
      return <Link to={`/dashboard/stock/${symbol}`} className="cursor-pointer hover:text-orange-600 underline">{symbol}</Link>
    }
  },
  {
    accessorKey: "amount",
    header: "No. Shares",
  },
  {
    accessorKey: "close",
    header: "Today's price",
  },
  {
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>%{val}</div>
    }
  },
  {
    accessorKey: "performance_year",
    header: "Performance (1 year)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_year")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "No info"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original;
      const [open, setOpen] = useState(false);

      const deleteStockListMutation = useMutation({
        mutationFn: deleteStockList,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stock-list-stats', id] })
          queryClient.invalidateQueries({ queryKey: ["stock-list", id] });
          queryClient.invalidateQueries({ queryKey: ["stock-lists"] });
        },
      });

      const handleDelete = async () => {
        try {
          const data = await deleteStockListMutation.mutateAsync({
            id: stock.sl_id,
            body: { symbol: stock.symbol },
          });
          console.log("Delete stock entry", data);
          toast({
            title: "Removal successful",
            description: `Stock ${stock.symbol} has been successfully removed from ${id}.`,
          });
        } catch (error: any) {
          console.error(error);
        }
      };

      return (
        <div className="flex gap-2 justify-end items-center">
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
                Remove stock from list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Stock?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove{" "}
                  <span className="font-bold">{stock.symbol}</span>?
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
                    Remove
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

export const publicStockListColumns: ColumnDef<StockList>[] = [
  {
    accessorKey: "sl_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "username",
    header: "Owner",
  },
  {
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    accessorKey: "performance_year",
    header: "Performance (1 year)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_year")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stockList = row.original
 
      return (
        <div className="flex gap-2 justify-end items-center">
          <Link to={`/dashboard/public-list/${stockList.sl_id}`}><Button variant="outline" size="sm"> View</Button></Link>
        </div>
      )
    },
  },
]

export const sharedStockListColumns: ColumnDef<StockList>[] = [
  {
    accessorKey: "sl_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "username",
    header: "Shared by",
  },
  {
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    accessorKey: "performance_year",
    header: "Performance (1 year)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_year")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "%0"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stockList = row.original
 
      return (
        <div className="flex gap-2 justify-end items-center">
          <Link to={`/dashboard/shared/${stockList.sl_id}`}><Button variant="outline" size="sm"> View</Button></Link>
        </div>
      )
    },
  },
]

export const getUnownedStockListColumns = (
  id: string,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"]
): ColumnDef<StockOwnedWithData>[] => [
  {
    accessorKey: "symbol",
    header: "Ticker",
    cell: ({ row }) => {
      const symbol: string = row.getValue("symbol")
      return <Link to={`/dashboard/stock/${symbol}`} className="cursor-pointer hover:text-orange-600 underline">{symbol}</Link>
    }
  },
  {
    accessorKey: "amount",
    header: "No. Shares",
  },
  {
    accessorKey: "close",
    header: "Today's price",
  },
  {
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>%{val}</div>
    }
  },
  {
    accessorKey: "performance_year",
    header: "Performance (1 year)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_year")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "No info"}</div>
    }
  },
 
];