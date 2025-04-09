import { getStock, getStockHistory, getStockPrediction } from "@/api/stockApiSlice";
import CandlestickChart from "@/components/candlestick-chart";
import { Spinner } from "@/components/ui/spinner";
import { CandlestickData } from "@/models/graph-models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Wand } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StockPredictionDialog } from "./StockPredictionDialog";

export const StockPage = () => {
  const { symbol } = useParams();
  const [period, setPeriod] = useState("month");
  const [predictPeriod, setPredictPeriod] = useState<string>();
  const [dates, setDates] = useState<string[]>([]);
  const [values, setValues] = useState<CandlestickData[]>([]);
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [apply, setApply] = useState(false);

  const navigate = useNavigate();

  const getStockHistoryQuery = useQuery({
    queryKey: ['stock', symbol, period],
    queryFn: () => getStockHistory(symbol as string, period),
    enabled: !!(symbol && symbol.length > 0)
  })

  const getPredictionQuery = useQuery({
    queryKey: ['stock-prediction', symbol, predictPeriod],
    queryFn: async () => {
      if (symbol && predictPeriod && apply) {
        setApply(false);
        return getStockPrediction(symbol, predictPeriod);
      }
      return {data: []}
    },
    enabled: !!(symbol && predictPeriod && apply)
  })

  const handleApplyPrediction = () => {
    setApply(true);
  }

  useEffect(() => {
    if (getStockHistoryQuery.data) {
      const sampleDates = (getStockHistoryQuery.data ?? []).map((d: any) => d?.timestamp.slice(0, 10));
      const sampleValues: CandlestickData[] = (getStockHistoryQuery.data ?? []).map((d: any) => ([
        d?.open,
        d?.close,
        d?.low,
        d?.high,
      ]));

      if (getPredictionQuery.data) {
        const predictionDates = (getPredictionQuery.data ?? []).map((d: any) => d?.timestamp.slice(0, 10));
        const predictionValues: CandlestickData[] = (getPredictionQuery.data ?? []).map((d: any) => ([
          Math.round(d?.price as number * 100) / 100,
          Math.round((d?.price as number) * 1.005 * 100) / 100,
          Math.round((d?.price as number) * 1.001 * 100) / 100,
          Math.round((d?.price as number) * 0.995 * 100) / 100,
        ]));
        sampleDates.push(...predictionDates);
        sampleValues.push(...predictionValues)
      }

      setDates(sampleDates);
      setValues(sampleValues);
    }
  }, [getStockHistoryQuery.data, getPredictionQuery.data])



  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between gap-4">
          <ChevronLeft className="cursor-pointer" onClick={() => navigate(-1)}/>
          <h1 className="text-xl">Viewing Stock: {symbol ?? ""}</h1>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setPredictionOpen(true)}> <Wand />Predict</Button>
        </div>
      </div>
      <div className="w-full items-end">
        <Label>Time period</Label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Time period</SelectLabel>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="1 year">Year</SelectItem>
              <SelectItem value="5 years">5 Years</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {symbol && (<StockPredictionDialog 
          symbol={symbol}
          period={predictPeriod}
          setPeriod={setPredictPeriod}
          open={predictionOpen}
          setOpen={setPredictionOpen}
          applyPrediction={handleApplyPrediction}
        />)}
      </div>
      {(getStockHistoryQuery.isLoading || getPredictionQuery.isLoading) ? (
        <Spinner/>
      ) : (
        <CandlestickChart title={`${symbol} - ${period}`} dates={dates} values={values} />
      )}
    </div>
  )
}