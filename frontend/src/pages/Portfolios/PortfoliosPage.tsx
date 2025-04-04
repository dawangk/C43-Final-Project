import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { createPortfolio, getPortfolios } from "@/api/portfolioApiSlice";
import { DataTable } from "@/components/data-table";
import { portfolioColumns } from "./portfolioColumns";

export const PortfoliosPage = () => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient()
  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })

  const getPortfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: getPortfolios
  })
  const {toast} = useToast();

  const handleCreate = async () => {
    try {
      const data = await createPortfolioMutation.mutateAsync({
        name: name,
      });
      console.log("Create Portfolio", data);
      toast({
        description: `Successfully created Portfolio ${name}`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message.startsWith("duplicate"))
      toast({
        title: "Error",
        variant: "destructive",
        description: "Cannot create Portfolio with same name."
      })
    }
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between w-full">
        <h1 className="text-xl">My Portfolios</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" onClick={() => setOpen(true)} >+ Create</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Portfolio</DialogTitle>
              <DialogDescription>
                Start a new portfolio to start investing.
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
        {getPortfoliosQuery.isLoading ? (
          <Spinner />
        ) : (
          <DataTable data={getPortfoliosQuery.data} columns={portfolioColumns}/>
        )}
      </div>
      
    </div>
  )
}