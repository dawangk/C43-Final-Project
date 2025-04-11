import { createStockList, deleteStockList, getStockLists, getStockListsWithData } from "@/api/stockListApiSlice";
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react"
import { StockListTable } from "../StockLists/StockListTable";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { getSharedStockListsWithData } from "@/api/shareApiSlice";
import { DataTable } from "@/components/data-table";
import { sharedStockListColumns } from "../StockLists/columns";

export const SharedStockListPage = () => {

  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const getSharedStockListsQuery = useQuery({
    queryKey: ["shared-stock-lists"],
    queryFn: getSharedStockListsWithData
  })
  const {toast} = useToast();

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between w-full">
        <h1 className="text-xl">Stock Lists Shared With Me</h1>

        <div className="flex gap-4">

        </div>
      
      </div>

      <div>
        {getSharedStockListsQuery.isLoading ? (
          <Spinner />
        ) : (
          <DataTable data={getSharedStockListsQuery?.data} columns={sharedStockListColumns}/>
        )}
      </div>
      
    </div>
  )
}