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
import { addFriend, getFriendRequests, getFriends, removeFriend, respondFriendRequest } from "@/api/friendsApiSlice";
import { FriendRequest, Friendship } from "@/models/db-models";

export const FriendsPage = () => {

  const [email, setEmail] = useState<string>();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient()

  const addFriendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
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
      queryClient.invalidateQueries({ queryKey: ['friends', 'friend-requests'] })
    },
  })

  const getFriendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends
  })

  const getFriendRequestsQuery = useQuery({
    queryKey: ["friend-requests"],
    queryFn: getFriendRequests
  })

  const {toast} = useToast();

  const handleAddFriend = async () => {
    try {
      const data = await addFriendMutation.mutateAsync({
        email: email,
      });
      console.log("Add friend", data);
      toast({
        description: `Added friend`
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

  const handleRemoveFriend = async (id: number) => {
    try {
      const data = await removeFriendMutation.mutateAsync({
        name: name,
      });
      console.log("Add friend", data);
      toast({
        description: `Added ${name} as friend`
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
        incoming_id: incoming_id,
        response: response,
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
                  <Label>Name</Label>
                  <Input onChange={(e) => setEmail(e.target.value)} value={email}/>
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button size="sm" onClick={handleAddFriend} >Add</Button>
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
            {getFriendsQuery.data?.map((friendShip: Friendship) => (
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>{friendShip?.user2_name} ({friendShip.user2_email})</div>
                <Button size="sm" variant="secondary" onClick={() => handleRemoveFriend(friendShip?.user2_id)}>Remove friend</Button>
              </div>  
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between w-full">
        <h1 className="text-xl">Pending Requests</h1>
        <div className="flex gap-4">
          <Button size="sm" onClick={() => setOpen(true)} >+ Add</Button>
        </div>
      </div>

      <div>
        {getFriendRequestsQuery.isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {getFriendRequestsQuery.data?.map((friendReq: FriendRequest) => (
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>From: {friendReq?.incoming_name} ({friendReq.incoming_email})</div>
                <div className="flex gap-4">
                  <Button size="sm" className="bg-green-500 text-white" variant="secondary" onClick={() => handleRespondRequest(friendReq?.incoming_id, "accept")}>Accept</Button>
                  <Button size="sm" className="bg-red-500 text-white" variant="secondary" onClick={() => handleRespondRequest(friendReq?.incoming_id, "deny")}>Deny</Button>
                </div>
              </div>  
            ))}
          </div>
        )}
      </div>

      
    </div>
  )
}