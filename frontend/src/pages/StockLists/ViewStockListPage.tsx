import { getStockList } from "@/api/stockListApiSlice";
import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { Stock } from "@/models/db-models";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import {viewStockListColumns} from "./columns"

export const ViewStockListPage = () => {

  const { id } = useParams();

  const getStockListQuery = useQuery({
    queryKey: ["stock-lists", id],
    queryFn: () => getStockList(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <h1 className="text-xl">{getStockListQuery.data?.info?.name ?? ""}</h1>
      {getStockListQuery.isLoading && <Spinner/>}
      {getStockListQuery.error && <p>Error fetching data</p>}
      {getStockListQuery.data && (
        <div className="flex flex-col gap-4">
          <p>No. Stocks: {getStockListQuery.data?.count}</p>
          <div>
             <DataTable data={getStockListQuery.data} columns={viewStockListColumns}/>
          </div>
        </div>
      )}
    </div>
  )
}