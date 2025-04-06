import { useToast } from "@/hooks/use-toast";
import { Portfolio, PortfolioWithData, StockOwned, StockOwnedWithData } from "@/models/db-models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
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
import { deletePortfolio, modifyFunds, updatePortfolio } from "@/api/portfolioApiSlice";
import { Input } from "@/components/ui/input";
import { deleteStockList, updateStockEntry } from "@/api/stockListApiSlice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getStock } from "@/api/stockApiSlice";
import { moneyToNumber } from "@/utils/moneyToNumber";

export const portfolioColumns: ColumnDef<PortfolioWithData>[] = [
  {
    accessorKey: "port_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "market_value",
    header: "Current Value",
    cell: ({ row }) => {
      const val: number = row.getValue("market_value")
      return <div className="font-bold">${val ?? 0}</div>
    }
  },
  {
    accessorKey: "cash_account",
    header: "Cash Available",
  },
  {
    accessorKey: "performance_day",
    header: "Performance (1D)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_day")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "No info"}</div>
    }
  },
  {
    accessorKey: "performance_ytd",
    header: "Performance (YTD)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_ytd")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "No info"}</div>
    }
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
      const [cash, setCash] = useState(0)
      const [fundAction, setFundAction] = useState("deposit")
      const [fundOpen, setFundOpen] = useState(false);
      
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
      const modifyFundsMutation = useMutation({
        mutationFn: modifyFunds,
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

      const handleModifyFunds = async () => {
        try {
          const data = await modifyFundsMutation.mutateAsync({
            body: {
              amount: (fundAction === "deposit" ? cash : -cash).toFixed(2)
            }, 
            id: portfolio.port_id
          });
          console.log("Modify funds", data);
          toast({
            description: `Successfully ${fundAction === "deposit" ? "deposited" : "withdrew"} $${cash}.`
          })
        } catch (error: any) {
          console.error(error);
          if (error.message === "Negative Balance Detected") {
            toast({
              variant: "destructive",
              description: `Cannot withdraw more than current cash balance.`
            })
          }
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
              <DropdownMenuItem onClick={() => setFundOpen(true)}>
                Add/Withdraw Funds
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

          <Dialog open={fundOpen} onOpenChange={setFundOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add/Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Deposit or withdraw funds from portfolio
                  <span className="font-bold">{" " + portfolio?.name}</span>
                </DialogDescription>
                <div className="border p-4 rounded-lg flex flex-col gap-4 ">
                  <Label>I want to:</Label>
                  <RadioGroup defaultValue="comfortable">
                    <div className="flex items-center space-x-2 font-light">
                      <RadioGroupItem value="default" id="r1" checked={fundAction === "deposit"} onClick={() => setFundAction("deposit")}/>
                      <Label htmlFor="r1" className="font-normal">Deposit</Label>
                    </div>
                    <div className="flex items-center space-x-2 font-light">
                      <RadioGroupItem value="comfortable" id="r2" checked={fundAction === "withdraw"} onClick={() => setFundAction("withdraw")}/>
                      <Label htmlFor="r2" className="font-normal">Withdraw</Label>
                    </div>
                  </RadioGroup>
                  <Label>{"Amount ($):"}</Label>
                  <Input type="number" value={cash} onChange={(e) => setCash(e.target.valueAsNumber)}></Input>
                </div>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button size="sm" onClick={handleModifyFunds} disabled={ cash === 0}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]

export const getViewPortfolioColumns = (
  port_id: string,
  portfolio: Portfolio,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"]
): ColumnDef<StockOwnedWithData>[] => [
  {
    accessorKey: "symbol",
    header: "Ticker",
  },
  {
    accessorKey: "amount",
    header: "Shares owned",
  },
  {
    accessorKey: "close",
    header: "Current price",
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
    accessorKey: "performance_ytd",
    header: "Performance (YTD)",
    cell: ({ row }) => {
      const val: number = row.getValue("performance_ytd")
      return <div className={`font-medium ${val >= 0 ? "text-green-500" : "text-red-500"}`}>{val ? "%" + val : "No info"}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original;
      const [open, setOpen] = useState(false);
      const [action, setAction] = useState("buy");
      const [amount, setAmount] = useState(0);

      const getStockInfoQuery = useQuery({
        queryKey: ['stock', stock.symbol],
        queryFn: () => getStock(stock.symbol),
        enabled: stock.symbol.length > 0
      })

      const updateStockListEntryMutation = useMutation({
        mutationFn: updateStockEntry,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['portfolio', port_id] })
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
        },
      })

      const deleteStockListMutation = useMutation({
        mutationFn: deleteStockList,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["portfolio", port_id] });
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
        },
      });

      const modifyFundsMutation = useMutation({
        mutationFn: modifyFunds,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['portfolio', port_id] })
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
        },
      })

      const handleBuySell = async () => {
        try {
          if (action === "buy") {
            // Check that the user has enough to buy
            if (moneyToNumber(portfolio?.cash_account) > getStockInfoQuery.data?.close * amount) {
              const data = await updateStockListEntryMutation.mutateAsync({
                body: {
                  symbol: stock.symbol, 
                  amount: stock.amount + amount,
                }, 
                id: stock.sl_id
              });
              console.log("Add stock", data);

              await modifyFundsMutation.mutateAsync({
                body: {
                  amount: -getStockInfoQuery.data?.close * amount
                }, 
                id: port_id
              });

              toast({
                description: `Successfully bought ${amount} shares of ${stock.symbol}.`
              })
            }
            else {
              toast({
                variant: "destructive",
                description: `You do not have enough funds to buy.`
              })
            }

          }
          else if (action === "sell") {
            if (stock.amount - amount < 0) {
              // Cannot sell
              toast({
                variant: "destructive",
                description: `You do not own enough shares to sell.`
              })
            }
            else if (stock.amount - amount === 0) {
              // Delete the stock from portfolio
              const data = await deleteStockListMutation.mutateAsync({
                id: stock.sl_id,
                body: { symbol: stock.symbol },
              });
              console.log("Sold stock", data);

              await modifyFundsMutation.mutateAsync({
                body: {
                  amount: getStockInfoQuery.data?.close * amount
                }, 
                id: port_id
              });
              console.log("updated")

              toast({
                description: `Successfully sold ${amount} shares of ${stock.symbol}.`
              })
            }
            else {
              const data = await updateStockListEntryMutation.mutateAsync({
                body: {
                  symbol: stock.symbol, 
                  amount: stock.amount - amount,
                }, 
                id: stock.sl_id
              });
              console.log("Sell stock", data);

              
              await modifyFundsMutation.mutateAsync({
                body: {
                  amount: getStockInfoQuery.data?.close * amount
                }, 
                id: port_id
              });
              console.log("updated")
              
              toast({
                description: `Successfully sold ${amount} shares of ${stock.symbol}.`
              })
            }
          } else {
            console.error("No action selected");
          }
        } catch (error: any) {
          console.error(error);
        }
      }

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
                <div className="w-full text-sm py-2">
                  <div className="flex flex-col">
                    <div>Price per share: <span className="font-bold">${getStockInfoQuery.data?.close}</span></div>
                    <div>Change today: 
                      <span className={`font-bold ${getStockInfoQuery.data?.performance_day >= 0 ? "text-green-500" : "text-red-500"}`}>
                        %{getStockInfoQuery.data?.performance_day}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border p-4 rounded-lg flex flex-col gap-4 ">
                  <Label>I want to:</Label>
                  <RadioGroup defaultValue="comfortable">
                    <div className="flex items-center space-x-2 font-light">
                      <RadioGroupItem value="default" id="r1" checked={action === "buy"} onClick={() => setAction("buy")}/>
                      <Label htmlFor="r1" className="font-normal">Buy</Label>
                    </div>
                    <div className="flex items-center space-x-2 font-light">
                      <RadioGroupItem value="comfortable" id="r2" checked={action === "sell"} onClick={() => setAction("sell")}/>
                      <Label htmlFor="r2" className="font-normal">Sell</Label>
                    </div>
                  </RadioGroup>
                  <Label>No. shares:</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)}></Input>
                  <div className="text-sm">Total Price: <span className="font-bold">${amount ? (getStockInfoQuery.data?.close * amount).toFixed(2) : 0}</span></div>
                </div>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button size="sm" onClick={handleBuySell} disabled={amount === 0}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];