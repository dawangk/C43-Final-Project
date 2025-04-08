import { DataTable } from "@/components/data-table";
import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom"
import {getViewPortfolioColumns} from "./portfolioColumns"
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
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { useToast } from "@/hooks/use-toast";
import { ChartNoAxesCombined, ChevronLeft } from "lucide-react";
import { getPortfolio, getPortfolioWithData, modifyFunds } from "@/api/portfolioApiSlice";
import { updateStockEntry } from "@/api/stockListApiSlice";
import { Input } from "@/components/ui/input";
import { StockOwned } from "@/models/db-models";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getStock } from "@/api/stockApiSlice";
import { moneyToNumber } from "@/utils/moneyToNumber";
import { MoneyInput } from "@/components/money-input";
import { FileUpload } from "@/components/file-upload";
import { PortfolioStatsDialog } from "./PortfolioStatsDialog";


export const ViewPortfolioPage = () => {

  const { id } = useParams();
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const {toast} = useToast();
  const queryClient = useQueryClient()
  const [cash, setCash] = useState(0)
  const [fundAction, setFundAction] = useState("deposit")
  const [fundOpen, setFundOpen] = useState(false);
  const [importOpen, setImportOpen]= useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const getPortfolioQuery = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => getPortfolioWithData(id as string),
    enabled: !!id // Query will only run if id exists (is truthy)
  })

  const p_info = getPortfolioQuery.data?.info

  const getStockInfoQuery = useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStock(symbol),
    enabled: symbol.length > 0
  })
  const addStockListEntryMutation = useMutation({
    mutationFn: updateStockEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] })
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      queryClient.invalidateQueries({ queryKey: ['portfolioStats'] })
    },
  })

  const modifyFundsMutation = useMutation({
    mutationFn: modifyFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', id] })
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
    },
  })

  useEffect(() => {
    if (symbol.length > 0) {
      getStockInfoQuery.refetch();
    }
  }, [symbol])

  const getCurrentAmount = (symbol: string) => {
    const stocksOwned: StockOwned[] = getPortfolioQuery.data?.stock_list?.data?.list;
    const curAmt = stocksOwned.find((s: StockOwned) => s.symbol === symbol)?.amount ?? 0;
    return curAmt;
  }

  const handleAdd = async () => {
    try {
      // check that user has enough to buy
      if (moneyToNumber(getPortfolioQuery.data?.info?.cash_account) >= getStockInfoQuery.data?.close * amount) {
        const data = await addStockListEntryMutation.mutateAsync({
          body: {
            symbol: symbol, 
            amount: amount + getCurrentAmount(symbol),
          }, 
          id: getPortfolioQuery.data?.info?.sl_id as string
        });
        console.log("Add stock", data);

        await modifyFundsMutation.mutateAsync({
          body: {
            amount: -getStockInfoQuery.data?.close * amount
          }, 
          id: id
        });

        toast({
          description: `Bought ${amount} shares of ${symbol} for $${getStockInfoQuery.data?.close * amount}.`
        })
      }
      else {
        toast({
          variant: "destructive",
          description: `You do not have enough funds to buy.`
        })
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  const handleModifyFunds = async () => {
    try {
      const data = await modifyFundsMutation.mutateAsync({
        body: {
          amount: (fundAction === "deposit" ? cash : -cash).toFixed(2)
        }, 
        id: id
      });
      console.log("Modify funds", data);
      toast({
        description: `Successfully ${fundAction === "deposit" ? "deposited" : "withdrew"} $${cash}.`
      })
    } catch (error: any) {
      console.error(error);
      if (error.message === "Negative Balance Detected") {
        toast({
          variant: "destructive",
          description: `Cannot withdraw more than current cash balance.`
        })
      }
    }
  }

  const handleImport = () => {

  }

  const columns = useMemo(() => {
    if (!id || !getPortfolioQuery.data) return [];
    return getViewPortfolioColumns(id, getPortfolioQuery.data, queryClient, toast);
  }, [id, queryClient, toast, getPortfolioQuery.data]);

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/portfolios"><ChevronLeft className="cursor-pointer"/></Link>
          <h1 className="text-xl">{getPortfolioQuery.data?.info?.name ?? ""}</h1>
        </div>
        <div className="flex gap-4">
          <Button size="sm" onClick={() => {
              setFundOpen(true)
            }}>
            Add/Withdraw Funds
          </Button>
          <Button size="sm" onClick={() => {
              setOpen(true)
            }}>
            Buy stock
          </Button>
          <Button size="sm" onClick={() => {
              setStatsOpen(true)
            }}>
              <ChartNoAxesCombined />
            Calculate Stats
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
              setImportOpen(true)
            }}>
            Import data
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buy stock</DialogTitle>
              <DialogDescription>
                Find a stock to add by searching its ticker.
              </DialogDescription>
              <div className="mt-4 flex flex-col gap-8 text-black">
                <StockSearch onSelect={(s: string) => { 
                  setSymbol(s);
                }}/>
                <div className="w-full border rounded-lg p-4 text-sm">
                  <div className="w-full flex gap-2 justify-between">
                    <div>
                      <div>Buying Stock: </div>
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
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <span>No. Shares</span>
                    <Input type="number" value={amount} onChange={(e) => setAmount(Math.round(e.target.valueAsNumber))}></Input>
                    <div>Total Price: <span className="font-bold">${amount ? (getStockInfoQuery.data?.close * amount).toFixed(2) : 0}</span></div>
                  </div>
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button 
                    size="sm" 
                    onClick={() => { 
                      handleAdd();
                    }}
                    disabled={amount === 0}
                  >Add</Button>
                </div>
              </div>
              
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog open={fundOpen} onOpenChange={setFundOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add/Withdraw Funds</DialogTitle>
              <DialogDescription>
                Deposit or withdraw funds from portfolio
                <span className="font-bold">{" " + getPortfolioQuery.data?.info?.name}</span>
              </DialogDescription>
              <div className="border p-4 rounded-lg flex flex-col gap-4 ">
                <Label>I want to:</Label>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2 font-light">
                    <RadioGroupItem value="default" id="r1" checked={fundAction === "deposit"} onClick={() => setFundAction("deposit")}/>
                    <Label htmlFor="r1" className="font-normal">Deposit</Label>
                  </div>
                  <div className="flex items-center space-x-2 font-light">
                    <RadioGroupItem value="comfortable" id="r2" checked={fundAction === "withdraw"} onClick={() => setFundAction("withdraw")}/>
                    <Label htmlFor="r2" className="font-normal">Withdraw</Label>
                  </div>
                </RadioGroup>
                <Label>{"Amount:"}</Label>
                <MoneyInput value={cash} onChange={setCash}/>
              </div>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleModifyFunds} disabled={ cash === 0}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import S&P500 data</DialogTitle>
              <DialogDescription>
                Please import data in .csv format. Ensure that dates added are after 2018-02-07 to prevent conflicts in data. See below for csv format:
                <br></br>
                <br></br>
                Timestamp,Open,High,Low,Close,Volume,Code
                <br></br>
                2013-02-08,15.07,15.12,14.63,14.75,8407500,AAL
                <br></br>
              </DialogDescription>
              <div className="border p-4 rounded-lg flex flex-col gap-4 ">
                    <FileUpload port_id={id}/>
              </div>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm" onClick={handleImport} disabled={ cash === 0}>
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {id && <PortfolioStatsDialog id={id} open={statsOpen} setOpen={setStatsOpen} stocks={getPortfolioQuery.data?.stock_list?.data?.list.map((s: StockOwned) => s.symbol)}/>}

      </div>
      <div className="flex gap-12 ">
        <div>
          <div>Current Value: </div>
          <span className="font-bold text-green-500 text-2xl"> ${getPortfolioQuery.data?.info?.market_value ?? 0}</span>
        </div>
        <div>
          <div>Cash Available: </div>
          <span className="font-bold text-2xl"> {getPortfolioQuery.data?.info?.cash_account}</span>
        </div>
        <div>
          <div>Performance (1D): </div>
          <span className={`font-bold text-2xl ${(p_info && p_info.performance_day >= 0) ? "text-green-500" : "text-red-500"}`}> {(p_info && p_info?.performance_day) ? "%" + p_info.performance_day  : "%0"}</span>
        </div>
        <div>
          <div>Performance (YTD): </div>
          <span className={`font-bold text-2xl ${(p_info && p_info.performance_ytd) >= 0 ? "text-green-500" : "text-red-500"}`}> {(p_info && p_info.performance_ytd) ? "%" + p_info.performance_ytd  : "%0"}</span>
        </div>
       
      </div>
      {getPortfolioQuery.isLoading && <Spinner/>}
      {getPortfolioQuery.error && <p>Error fetching data</p>}
      {getPortfolioQuery.data && (
        <div className="flex flex-col gap-4">
          <p>No. Stocks: {getPortfolioQuery.data?.stock_list?.data?.count}</p>
          <div>
            <DataTable
              data={getPortfolioQuery.data?.stock_list?.data?.list}
              columns={columns}
            />
          </div>
        </div>
      )}
    </div>
  )
}