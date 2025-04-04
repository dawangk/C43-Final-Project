import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom"
import {getViewPortfolioColumns} from "./portfolioColumns"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { getPortfolio } from "@/api/portfolioApiSlice";
import { updateStockEntry } from "@/api/stockListApiSlice";
import { Input } from "@/components/ui/input";
import { StockOwned } from "@/models/db-models";


export const ViewPortfolioPage = () => {

  const { id } = useParams();
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const {toast} = useToast();
  const queryClient = useQueryClient()

  const getPortfolioQuery = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => getPortfolio(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const addStockListEntryMutation = useMutation({
    mutationFn: updateStockEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] })
    },
  })

  const getCurrentAmount = (symbol: string) => {
    const stocksOwned: StockOwned[] = getPortfolioQuery.data?.stock_list?.data?.list;
    const curAmt = stocksOwned.find((s: StockOwned) => s.symbol === symbol)?.amount ?? 0;
    return curAmt;
  }

  const handleAdd = async () => {
    try {
      const data = await addStockListEntryMutation.mutateAsync({
        body: {
          symbol: symbol, 
          amount: amount + getCurrentAmount(symbol),
        }, 
        id: getPortfolioQuery.data?.info?.sl_id as string
      });
      console.log("Add stock", data);
      toast({
        description: `Added ${symbol} to list.`
      })
    } catch (error: any) {
      console.error(error);
    }
  }

  const columns = useMemo(() => {
    if (!id) return [];
    return getViewPortfolioColumns(id, queryClient, toast);
  }, [id, queryClient, toast]);

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/stock-lists"><ChevronLeft className="cursor-pointer"/></Link>
          <h1 className="text-xl">{getPortfolioQuery.data?.info?.name ?? ""}</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" onClick={() => setOpen(true)}>Buy stock</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buy stock</DialogTitle>
              <DialogDescription>
                Find a stock to add by searching its ticker.
              </DialogDescription>
              <div className="mt-4 flex flex-col gap-8 text-black">
                <StockSearch onSelect={(s: string) => { 
                  setSymbol(s);
                }}/>
                <div className="border rounded-lg p-4 text-sm">
                  <div>Adding Stock: <span className="font-bold">{symbol}</span></div>
                  <div className="mt-4 flex flex-col gap-2">
                    <span>No. Shares</span>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)}></Input>
                  </div>
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button size="sm" onClick={() => { 
                    handleAdd();
                  }}>Add</Button>
                </div>
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {getPortfolioQuery.isLoading && <Spinner/>}
      {getPortfolioQuery.error && <p>Error fetching data</p>}
      {getPortfolioQuery.data && (
        <div className="flex flex-col gap-4">
          <p>No. Stocks: {getPortfolioQuery.data?.stock_list?.data?.count}</p>
          <div>
            <DataTable
              data={getPortfolioQuery.data?.stock_list?.data?.list}
              columns={columns}
            />
          </div>
        </div>
      )}
    </div>
  )
}