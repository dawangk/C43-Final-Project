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
import { ChartNoAxesCombined, ChevronLeft, UserIcon } from "lucide-react";
import { getStock } from "@/api/stockApiSlice";
import { StatsDialog } from "../Portfolios/StatsDialog";
import { StockOwned, UserReview } from "@/models/db-models";
import { deleteReview, getReviews, updateReview } from "@/api/reviewsApiSlice";
import { getUsersShared, shareStockList } from "@/api/shareApiSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const ViewStockListPage = () => {

  const { id } = useParams();
  const [symbol, setSymbol] = useState("");
  const [open, setOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareOpen, setShareOpen ] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false)
  const [newContent, setNewContent] = useState<string>(""); 

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

  const getStockInfoQuery = useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStock(symbol),
    enabled: symbol.length > 0
  })

  const getSharedUsersQuery = useQuery({
    queryKey: ['shared-users', id],
    queryFn: () => getUsersShared(id as string),
    enabled: !!id
  })

  const addStockListEntryMutation = useMutation({
    mutationFn: updateStockEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-list-stats', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-list', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
    },
  })

  const shareStockListMutation = useMutation({
    mutationFn: shareStockList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-users', id] })
    },
  })

    const updateReviewMutation = useMutation({
      mutationFn: updateReview,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      },
    })
    const me = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const handleShare = async () => {
    try {
      const data = await shareStockListMutation.mutateAsync({
        body: {
          email: shareEmail,
        }, 
        id: id as string
      });
      console.log("Share", data);
      toast({
        description: `Shared stock list to ${shareEmail}`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith("duplicate")) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Already shared with that user!"
        })
      }
      else {
        toast({
          title: "Error",
          variant: "destructive",
          description: error.message
        })
      }
    }
  }


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

  const handleDeleteReview = async () => {
    try {
      const data = await deleteReviewMutation.mutateAsync(id as string);
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
    return getViewStockListColumns(id, queryClient, toast);
  }, [id, queryClient, toast]);

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/stock-lists"><ChevronLeft className="cursor-pointer"/></Link>
          <h1 className="text-xl">{getStockListQuery.data?.info?.name ?? ""}</h1>
        </div>

        <div className="flex gap-4">
          <Button size="sm" onClick={() => setOpen(true)}>Add stock</Button>
          <Button size="sm" onClick={() => {
              setStatsOpen(true)
            }}>
              <ChartNoAxesCombined />
            Calculate Stats
          </Button>
          <Button size="sm" onClick={() => setShareOpen(true)} variant="secondary">Share</Button>

        </div>

        <Dialog open={open} onOpenChange={setOpen}>
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
                      <Link to={`/dashboard/stock/${symbol}`} className="cursor-pointer hover:text-orange-600 underline"><div className="font-bold text-2xl mb-4 mt-2">{symbol}</div></Link>
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

        
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share</DialogTitle>
              <div className="pt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>Email</Label>
                  <Input onChange={(e) => setShareEmail(e.target.value)} value={shareEmail}/>
                  <Label>Currently shared with the following users:</Label>
                  <div className="flex flex-col gap-2 p-2 border rounded-lg text-sm">
                    {getSharedUsersQuery.data?.length === 0 && <div className="text-gray-400">No users found</div>}
                    {getSharedUsersQuery.data?.map((user: any) => (
                      <div key={user?.user_id}>{user?.username} ({user?.email})</div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                    <Button 
                      size="sm"
                      onClick={handleShare }
                      disabled={!shareEmail}
                    >Add</Button>
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
                  <Button size="sm" variant="secondary" onClick={handleDeleteReview}>Delete Review</Button>
                  {(review.user_id === me?.user_id) && 
                    <Button size="sm" variant="secondary" onClick={() => setEditReviewOpen(true)}>Edit Review</Button>
                  }
                  </div>
                </div>

                <div className="border rounded-lg w-full text-sm p-2 text-wrap">
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