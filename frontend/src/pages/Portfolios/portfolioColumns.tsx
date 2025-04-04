import { useToast } from "@/hooks/use-toast";
import { Portfolio, StockOwned } from "@/models/db-models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { deletePortfolio, updatePortfolio } from "@/api/portfolioApiSlice";
import { Input } from "@/components/ui/input";
import { deleteStockList } from "@/api/stockListApiSlice";

export const portfolioColumns: ColumnDef<Portfolio>[] = [
  {
    accessorKey: "port_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "cash_account",
    header: "Cash Available",
  },
  {
    accessorKey: "performance_ytd",
    header: "Performance (YTD)",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const portfolio = row.original

      const queryClient = useQueryClient()
      const {toast} = useToast();
      const [open, setOpen] = useState(false)
      const [openRename, setOpenRename] = useState(false)
      const [newName, setNewName] = useState("")
      
      const deletePortfolioMutation = useMutation({
        mutationFn: deletePortfolio,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
        },
      })
      const updatePortfolioMutation = useMutation({
        mutationFn: updatePortfolio,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
        },
      })

      const handleDelete = async () => {
        try {
          const data = await deletePortfolioMutation.mutateAsync(portfolio.port_id.toString());
          console.log("Delete portfolio", data);
          toast({
            title: "Delete successful",
            description: `Portfolio ${portfolio.name} has been successfully deleted.`
          })
        } catch (error: any) {
          console.error(error);
        }
      }

      const handleRename = async () => {
        try {
          const data = await updatePortfolioMutation.mutateAsync({
            id: portfolio.port_id ,
            body: {
              name: newName
            }
          });
          console.log("Rename portfolio", data);
          toast({
            description: `Portfolio ID ${portfolio.port_id} has been successfully renamed to ${newName}.`
          })
        } catch (error: any) {
          console.error(error);
        }
      }
    
 
      return (
        <div className="flex gap-2 justify-end items-center">
          <Link to={`/dashboard/portfolios/${portfolio.port_id}`}><Button variant="outline" size="sm"> View</Button></Link>
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
                Delete Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenRename(true)}>
                Rename Portfolio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Portfolio?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <span className="font-bold">{portfolio.name}</span>?
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
                <DialogTitle>Rename Portfolio</DialogTitle>
                <DialogDescription>
                  You are renaming portfolio {portfolio.name}
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
        </div>
      )
    },
  },
]

export const getViewPortfolioColumns = (
  sl_id: string,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"]
): ColumnDef<StockOwned>[] => [
  {
    accessorKey: "symbol",
    header: "Ticker",
  },
  {
    accessorKey: "amount",
    header: "Shares owned",
  },
  {
    accessorKey: "price",
    header: "Current price",
  },
  {
    accessorKey: "performance_ytd",
    header: "Performance (YTD)",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original;
      const [open, setOpen] = useState(false);

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
                Manage Stock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Stock</DialogTitle>
                <DialogDescription>
                  Managing stock
                  <span className="font-bold">{" " + stock.symbol}</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button size="sm">
                    Save
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