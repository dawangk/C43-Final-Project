import { getStockList, updateStockEntry } from "@/api/stockListApiSlice";
import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import {viewStockListColumns} from "./columns"
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { useToast } from "@/hooks/use-toast";

export const ViewStockListPage = () => {

  const { id } = useParams();
  const [symbol, setSymbol] = useState("");
  const [open, setOpen] = useState(false);
  const {toast} = useToast();
  const queryClient = useQueryClient()

  const getStockListQuery = useQuery({
    queryKey: ["stock-list", id],
    queryFn: () => getStockList(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const addStockListEntryMutation = useMutation({
    mutationFn: updateStockEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-list', id] })
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
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl">{getStockListQuery.data?.info?.name ?? ""}</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setOpen(true)}>Add stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add stock</DialogTitle>
              <DialogDescription>
                <div>Find a stock to add by searching its ticker.</div>
                <div className="mt-4 flex flex-col gap-8 text-black">
                  <StockSearch onSelect={(s: string) => { 
                    setSymbol(s);
                  }}/>
                  <div className="border rounded-lg p-4">
                    Adding Stock: <span className="font-bold">{symbol}</span>
                  </div>
                  <div className="flex gap-4 items-center justify-center">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button size="sm" onClick={() => { 
                        handleAdd();
                        setOpen(false); // Close on add
                      }}>Add</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogDescription>
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
             <DataTable data={getStockListQuery.data?.list} columns={viewStockListColumns}/>
          </div>
        </div>
      )}
    </div>
  )
}