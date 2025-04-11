import { getStockListWithData } from "@/api/stockListApiSlice";
import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChartNoAxesCombined, ChevronLeft, UserIcon } from "lucide-react";
import { getStock } from "@/api/stockApiSlice";
import { StatsDialog } from "../Portfolios/StatsDialog";
import { StockOwned, UserReview } from "@/models/db-models";
import { deleteReview, getReviews } from "@/api/reviewsApiSlice";
import { getUnownedStockListColumns } from "../StockLists/columns";

export const ViewSharedStockListPage = () => {

  const { id } = useParams();
  const [statsOpen, setStatsOpen] = useState(false);

  const {toast} = useToast();
  const queryClient = useQueryClient()

  const getStockListQuery = useQuery({
    queryKey: ["stock-list", id],
    queryFn: () => getStockListWithData(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const getReviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReviews(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
    },
  })

  const handleDeleteReview = async (sl_id: number, user_id: number) => {
    try {
      const data = await deleteReviewMutation.mutateAsync({
        body: {
          sl_id,
          user_id
        }, 
      });
      console.log("Delete review", data);
      toast({
        description: `Deleted reivew.`
      })
    } catch (error: any) {
      console.error(error);
    }
  }

  const columns = useMemo(() => {
    if (!id) return [];
    return getUnownedStockListColumns(id, queryClient, toast);
  }, [id, queryClient, toast]);

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/stock-lists"><ChevronLeft className="cursor-pointer"/></Link>
          <h1 className="text-xl">{getStockListQuery.data?.info?.name ?? ""}</h1>
        </div>

        <div className="flex gap-4">
          <Button size="sm" onClick={() => {
              setStatsOpen(true)
            }}>
              <ChartNoAxesCombined />
            View Stats
          </Button>
        </div>

        {id && <StatsDialog sl_id={id} open={statsOpen} setOpen={setStatsOpen} stocks={getStockListQuery.data?.list.map((s: StockOwned) => s.symbol)}/>}
        
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

      <div className="flex justify-between w-full">
        <h1 className="text-xl">Reviews</h1>
        <div className="flex gap-4">
        </div>
      </div>

      <div>
        {getReviewsQuery.isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {getReviewsQuery.data?.map((review: UserReview) => (
              <div className="p-4 border rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <UserIcon />
                    <div>{review?.reviewer_name} ({review?.reviewer_email}) said:</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleDeleteReview(review.sl_id, review.user_id)}>Delete Review</Button>

                </div>

                <div className="border rounded-lg w-full text-sm p-2">
                  {review?.content}
                </div>
              </div>  
            ))}
          </div>
        )}
      </div>
    </div>
  )
}