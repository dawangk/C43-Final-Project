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
import { StockListTable } from "./StockListTable";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export const StockListPage = () => {

  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient()
  const createStockListMutation = useMutation({
    mutationFn: createStockList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-lists'] })
    },
  })

  const getStockListsQuery = useQuery({
    queryKey: ["stock-lists"],
    queryFn: getStockListsWithData
  })
  const {toast} = useToast();

  const handleCreate = async () => {
    try {
      const data = await createStockListMutation.mutateAsync({
        name: name,
      });
      console.log("Create stock list", data);
      toast({
        description: `Successfully created stock list ${name}`
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
        <h1 className="text-xl">My Stock Lists</h1>

        <div className="flex gap-4">
          <Button size="sm" onClick={() => setOpen(true)} >+ Create</Button>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stock List</DialogTitle>
              <DialogDescription>
                Make a new stock list to keep track of your favourite stocks.
              </DialogDescription>
              <div className="pt-4 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Label>Name</Label>
                  <Input onChange={(e) => setName(e.target.value)} value={name}/>
                </div>
                
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button size="sm" onClick={handleCreate} >Create</Button>
                  </DialogClose>
                </div>
                
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {getStockListsQuery.isLoading ? (
          <Spinner />
        ) : (
          <StockListTable data={getStockListsQuery?.data} />
        )}
      </div>
      
    </div>
  )
}