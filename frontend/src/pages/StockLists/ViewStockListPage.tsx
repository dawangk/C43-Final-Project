import { getStockList, getStockListWithData, updateStockEntry } from "@/api/stockListApiSlice";
import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom"
import {getViewStockListColumns} from "./columns"
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
import { getStock } from "@/api/stockApiSlice";

export const ViewStockListPage = () => {

  const { id } = useParams();
  const [symbol, setSymbol] = useState("");
  const [open, setOpen] = useState(false);
  const {toast} = useToast();
  const queryClient = useQueryClient()

  const getStockListQuery = useQuery({
    queryKey: ["stock-list", id],
    queryFn: () => getStockListWithData(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const getStockInfoQuery = useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStock(symbol),
    enabled: symbol.length > 0
  })

  const addStockListEntryMutation = useMutation({
    mutationFn: updateStockEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-list', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
    },
  })

  const handleAdd = async () => {
    try {
      const data = await addStockListEntryMutation.mutateAsync({
        body: {
          symbol: symbol, 
          amount: 1
        }, 
        id: id as string
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
    return getViewStockListColumns(id, queryClient, toast);
  }, [id, queryClient, toast]);

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/stock-lists"><ChevronLeft className="cursor-pointer"/></Link>
          <h1 className="text-xl">{getStockListQuery.data?.info?.name ?? ""}</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" onClick={() => setOpen(true)}>Add stock</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add stock</DialogTitle>
              <DialogDescription>
                Find a stock to add by searching its ticker.
              </DialogDescription>
              <div className="mt-4 flex flex-col gap-8 text-black">
                <StockSearch onSelect={(s: string) => { 
                  setSymbol(s);
                }}/>
                <div className="border rounded-lg p-4 text-sm">
                  <div className="w-full flex gap-2 justify-between">
                    <div>
                      <div>Adding Stock: </div>
                      <div className="font-bold text-2xl mb-4 mt-2">{symbol}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>Price per share: <span className="font-bold">${getStockInfoQuery.data?.close}</span></div>
                      <div>Change today: 
                        <span className={`font-bold ${getStockInfoQuery.data?.performance_day >= 0 ? "text-green-500" : "text-red-500"}`}>
                          %{getStockInfoQuery.data?.performance_day}
                        </span>
                      </div>
                    </div>

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
      {getStockListQuery.isLoading && <Spinner/>}
      {getStockListQuery.error && <p>Error fetching data</p>}
      {getStockListQuery.data && (
        <div className="flex flex-col gap-4">
          <p>No. Stocks: {getStockListQuery.data?.count}</p>
          <div>
            <DataTable
              data={getStockListQuery.data?.list}
              columns={columns}
            />
          </div>
        </div>
      )}
    </div>
  )
}