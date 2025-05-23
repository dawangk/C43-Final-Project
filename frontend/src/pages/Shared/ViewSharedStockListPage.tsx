import { getStockListWithData } from "@/api/stockListApiSlice";
import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChartNoAxesCombined, ChevronLeft, UserIcon } from "lucide-react";
import { getStock } from "@/api/stockApiSlice";
import { StatsDialog } from "../Portfolios/StatsDialog";
import { StockOwned, UserReview } from "@/models/db-models";
import { createReview, deleteReview, getReviews, updateReview } from "@/api/reviewsApiSlice";
import { getUnownedStockListColumns } from "../StockLists/columns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const ViewSharedStockListPage = () => {

  const { id } = useParams();
  const [statsOpen, setStatsOpen] = useState(false);
  const [createReviewOpen, setCreateReviewOpen] = useState(false)
  const [editReviewOpen, setEditReviewOpen] = useState(false)
  const [reviewContent, setReviewContent] = useState<string>("");
  const [newContent, setNewContent] = useState<string>(""); 
  
  const me = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const {toast} = useToast();
  const queryClient = useQueryClient()
  const navigate = useNavigate();

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

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
    },
  })

  const handleCreateReview = async () => {
    try {
      const data = await createReviewMutation.mutateAsync({
        sl_id: id,
        content: reviewContent,
      });
      console.log("Create review", data);
      toast({
        description: `Created reivew.`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith("duplicate")) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Already reviewed!"
        })
      }
    }
  }


  const handleDeleteReview = async (reviewer_id: string) => {
    try {
      const data = await deleteReviewMutation.mutateAsync({reviewer_id, sl_id: id as string});
      console.log("Delete review", data);
      toast({
        description: `Deleted reivew.`
      })
    } catch (error: any) {
      console.error(error);
    }
  }

  const handleUpdateReview = async () => {
    try {
      const data = await updateReviewMutation.mutateAsync( {
        id: id as string,
        body: {
          content: newContent
        }
      } );
      console.log("Update review", data);
      toast({
        description: `Updated reivew.`
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
          <ChevronLeft className="cursor-pointer" onClick={() => navigate(-1)}/>
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

      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl">Reviews</h1>
        <div className="flex gap-4">
          <Button onClick={() => setCreateReviewOpen(true)}>+ Add review</Button>
        </div>
      </div>

      <Dialog open={createReviewOpen} onOpenChange={setCreateReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add review</DialogTitle>
              <div className="pt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>Content</Label>
                  <Textarea onChange={(e) => setReviewContent(e.target.value)} value={reviewContent}/>
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      size="sm"
                      onClick={handleCreateReview }
                      disabled={!reviewContent}
                    >Add</Button>
                      </DialogClose>
                </div>
                
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        <Dialog open={editReviewOpen} onOpenChange={setEditReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit review</DialogTitle>
              <div className="pt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>Content</Label>
                  <Textarea onChange={(e) => setNewContent(e.target.value)} value={newContent}/>
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      size="sm"
                      onClick={handleUpdateReview }
                      disabled={!newContent}
                    >Save</Button>
                      </DialogClose>
                </div>
                
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>
      <div>
        {getReviewsQuery.isLoading ? (
          <Spinner />
        ) : getReviewsQuery.data?.length === 0 ? (
          <div>No reviews found</div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {getReviewsQuery.data?.map((review: UserReview) => (
              <div className="p-4 border rounded-lg flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <UserIcon />
                    <div>{review?.reviewer_name} ({review?.reviewer_email}) said:</div>
                  </div>
                  <div className="flex gap-4">
                  {(review.user_id === me?.user_id || getStockListQuery.data?.info?.user_id === me?.user_id) && 
                    <Button size="sm" variant="secondary" onClick={() => handleDeleteReview(review?.user_id.toString())}>Delete Review</Button>
                  }
                  {(review.user_id === me?.user_id) && 
                    <Button size="sm" variant="secondary" onClick={() => setEditReviewOpen(true)}>Edit Review</Button>
                  }
                  </div>
                </div>

                <div className="border rounded-lg w-full text-sm p-2 text-wrap break-all">
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