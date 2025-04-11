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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { addFriend, getIncomingFriendRequests, getFriends, removeFriend, respondFriendRequest, getOutgoingFriendRequests } from "@/api/friendsApiSlice";
import { FriendRequest, Friendship } from "@/models/db-models";

export const FriendsPage = () => {

  const [email, setEmail] = useState<string>();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient()

  const addFriendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-friend-requests'] })
    },
  })

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const respondFriendRequestMutation = useMutation({
    mutationFn: respondFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['incoming-friend-requests'] })
    },
  })

  const getFriendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends
  })

  const getIncomingFriendRequestsQuery = useQuery({
    queryKey: ["incoming-friend-requests"],
    queryFn: getIncomingFriendRequests
  })

  const getOutgoingFriendRequestsQuery = useQuery({
    queryKey: ["outgoing-friend-requests"],
    queryFn: getOutgoingFriendRequests
  })

  const {toast} = useToast();

  const handleAddFriend = async () => {
    try {
      const data = await addFriendMutation.mutateAsync({
        email: email
      });
      console.log("Add friend", data);
      toast({
        description: `Sent friend request to ${email}`
      })
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      })
    }
  }

  const handleRemoveFriend = async (id: number) => {
    try {
      const data = await removeFriendMutation.mutateAsync(
        id,
      );
      console.log("Remove friend", data);
      toast({
        description: `Removed friend`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith("duplicate"))
      toast({
        title: "Error",
        variant: "destructive",
        description: "Cannot create stock list with same name."
      })
    }
  }

  // response 'accept' or 'deny'
  const handleRespondRequest = async (incoming_id: number, response: string) => {
    try {
      const data = await respondFriendRequestMutation.mutateAsync({
        id: incoming_id,
        body: {
          status: response
        },
      });
      console.log("Respond to friend request", data);
      toast({
        description: `Responded to friend request with ${response}`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith("duplicate"))
      toast({
        title: "Error",
        variant: "destructive",
        description: "Cannot create stock list with same name."
      })
    }
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between w-full">
        <h1 className="text-xl">My Friends</h1>
        <div className="flex gap-4">
          <Button size="sm" onClick={() => setOpen(true)} >+ Add</Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add friend</DialogTitle>
              <div className="pt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>Email</Label>
                  <Input onChange={(e) => setEmail(e.target.value)} value={email}/>
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
                      onClick={handleAddFriend }
                      disabled={!email}
                    >Add</Button>
                  </DialogClose>
                </div>
                
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {getFriendsQuery.isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {getFriendsQuery.data?.result?.map((friendShip: Friendship) => (
              <div className="p-4 border rounded-lg flex justify-between items-center" key={friendShip.user_id}>
                <div>{friendShip?.username} ({friendShip.email})</div>
                <Button size="sm" variant="secondary" onClick={() => handleRemoveFriend(friendShip?.user_id)}>Remove friend</Button>
              </div>  
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between w-full">
        <h1 className="text-xl">Incoming Requests</h1>
      </div>

      <div>
        {getIncomingFriendRequestsQuery.isLoading ? (
          <Spinner />
        ) : getIncomingFriendRequestsQuery.data?.result?.length === 0 ? (
          <div>None</div>
        ) :  (
          <div className="flex flex-col gap-4 w-full">
            {getIncomingFriendRequestsQuery.data?.result?.map((friendReq: FriendRequest) => (
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>From: {friendReq?.username} ({friendReq.email})</div>
                <div className="flex gap-4">
                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600"onClick={() => handleRespondRequest(friendReq?.user_id, "accepted")}>Accept</Button>
                  <Button size="sm" className="bg-red-500 text-white hover:bg-red-600"  onClick={() => handleRespondRequest(friendReq?.user_id, "rejected")}>Reject</Button>
                </div>
              </div>  
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between w-full">
        <h1 className="text-xl">Outgoing Requests</h1>
      </div>

      <div>
        {getOutgoingFriendRequestsQuery.isLoading ? (
          <Spinner />
        ) : getOutgoingFriendRequestsQuery.data?.result?.length === 0 ? (
          <div>None</div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {getOutgoingFriendRequestsQuery.data?.result?.map((friendReq: FriendRequest) => (
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>To: {friendReq?.username} ({friendReq.email})</div>
                <div className="flex gap-4">
                  Status: {friendReq?.status.toUpperCase()}
                </div>
              </div>  
            ))}
          </div>
        )}
      </div>

      
    </div>
  )
}