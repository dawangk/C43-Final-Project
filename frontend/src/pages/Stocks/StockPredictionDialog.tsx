import { getStockPrediction } from "@/api/stockApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StockPredictionDialogProps {
  symbol: string
  period?: string,
  setPeriod: (_: string) => void,
  open: boolean,
  setOpen: (_: boolean) => void;
  applyPrediction: () => void;
}

export const StockPredictionDialog =({
  symbol,
  period,
  setPeriod,
  open,
  setOpen,
  applyPrediction
}: StockPredictionDialogProps) => {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-auto h-auto max-w-fit max-h-screen">
        <DialogHeader>
          <DialogTitle>Stock Statistics</DialogTitle>
          <DialogDescription>
            Predict future stock prices for {symbol}.
          </DialogDescription>
            <div className="p-4">
              <Label>Time Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Time period</SelectLabel>
                    <SelectItem value="clear">Clear Selection</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="1 year">Year</SelectItem>
                    <SelectItem value="5 years">5 Years</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>

          </DialogClose>
            <Button type="button" onClick={() => {
              applyPrediction();
              setOpen(false);
            }}>
                Apply
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}