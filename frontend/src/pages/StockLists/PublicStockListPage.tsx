import { getPublicStockListsWithData } from "@/api/stockListApiSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StockListTable } from "./StockListTable";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { publicStockListColumns } from "./columns";

export const PublicStockListPage = () => {

  const queryClient = useQueryClient()

  const getPublicStockListsQuery = useQuery({
    queryKey: ["stock-lists"],
    queryFn: getPublicStockListsWithData
  })
  const {toast} = useToast();

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between w-full">
        <h1 className="text-xl">Browse Public Lists</h1>
      </div>

      <div>
        {getPublicStockListsQuery.isLoading ? (
          <Spinner />
        ) : (
          <DataTable data={getPublicStockListsQuery?.data} columns={publicStockListColumns}/>
        )}
      </div>
      
    </div>
  )
}