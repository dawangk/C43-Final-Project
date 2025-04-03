import { getStockList } from "@/api/stockListApiSlice";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"

export const ViewStockListPage = () => {

  const { id } = useParams();

  const getStockListQuery = useQuery({
    queryKey: ["stock-lists", id],
    queryFn: () => getStockList(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  return (
    <div>
      {getStockListQuery.isLoading && <Spinner/>}
      {getStockListQuery.error && <p>Error fetching data</p>}
      {getStockListQuery.data && (
        <div>
        </div>
      )}
    </div>
  )
}