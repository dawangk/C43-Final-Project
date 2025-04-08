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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { createPortfolio, getPortfoliosWithData, transferFunds } from "@/api/portfolioApiSlice";
import { DataTable } from "@/components/data-table";
import { portfolioColumns } from "./portfolioColumns";
import { Portfolio, PortfolioWithData } from "@/models/db-models";
import { MoneyInput } from "@/components/money-input";

export const PortfoliosPage = () => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [transferFundsOpen, setTransferFundsOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [portfolio1, setPortfolio1] = useState<string>();
  const [portfolio2, setPortfolio2] = useState<string>();
  const queryClient = useQueryClient()
  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })

  
  const transferFundsMutation = useMutation({
    mutationFn: transferFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio1] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio2] })
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })

  const getPortfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: getPortfoliosWithData
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

  
  const handleTransferFunds = async () => {
    try {
      const data = await transferFundsMutation.mutateAsync({
        id_1: Number(portfolio1),
        id_2: Number(portfolio2),
        amount: transferAmount,
      });
      console.log("Transfer funds", data);
      toast({
        description: `Successfully Transferred $${transferAmount}.`
      })
    } catch (error: any) {
      console.error(error);
        toast({
          variant: "destructive",
          description: `Error transferring. Please try again later.`
        })
    }
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between w-full">
        <h1 className="text-xl">My Portfolios</h1>
        <div className="flex gap-4">
          <Button size="sm" onClick={() => setOpen(true)} >+ Create</Button>
          <Button variant="outline" size="sm" onClick={() => setTransferFundsOpen(true)}> Transfer Funds</Button>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>

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

        <Dialog open={transferFundsOpen} onOpenChange={setTransferFundsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
              <DialogDescription>
                Transfer Funds to a different portfolio:
              </DialogDescription>
              <div className="border p-4 rounded-lg flex flex-col gap-4 ">
                <Label>From</Label>
                <Select value={portfolio1} onValueChange={setPortfolio1}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {getPortfoliosQuery.data && getPortfoliosQuery.data.map((p: PortfolioWithData) => (
                        <SelectItem key={p.port_id} value={p.port_id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Label>To</Label>
                <Select value={portfolio2} onValueChange={setPortfolio2}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {getPortfoliosQuery.data && getPortfoliosQuery.data.map((p: PortfolioWithData) => (
                        <SelectItem key={p.port_id} value={p.port_id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Label>{"Amount:"}</Label>
                <MoneyInput value={transferAmount} onChange={setTransferAmount}/>
              </div>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleTransferFunds} disabled={ transferAmount === 0 || portfolio1 === portfolio2}>
                Confirm
              </Button>
            </DialogFooter>
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