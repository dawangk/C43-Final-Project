import { getPortfolioStats } from "@/api/portfolioApiSlice";
import { DataTable } from "@/components/data-table";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { coeff_and_beta_columns } from "./portfolioColumns";
import { generateCorrelationColumns, pivotCorrelationMatrix } from "@/utils/pivotTable";
import { MatrixCell } from "@/models/db-models";
import { Label } from "@/components/ui/label";

interface PortfolioStatsDialogProps {
  id: string,
  open: boolean,
  setOpen: (_: boolean) => void;
  stocks: string[]
}

export const PortfolioStatsDialog = ({
  id,
  open,
  setOpen,
  stocks
}: PortfolioStatsDialogProps) => {

  const [period, setPeriod] = useState("month");

  const getStatisticsQuery = useQuery({
    queryKey: ['portfolioStats', id, period],
    queryFn: () => getPortfolioStats(id, period),
    enabled: !!(id && period)
  })

  const matrix = getStatisticsQuery.data?.matrix ?? []
  const pivotedData = useMemo(() => pivotCorrelationMatrix(matrix), [matrix])
  const stockList = useMemo(() => [...new Set(matrix.flatMap((m: MatrixCell) => [m.stock_a, m.stock_b]))].sort(), [matrix])
  const columns = useMemo(() => generateCorrelationColumns(stockList as string[]), [stockList])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="w-auto h-auto max-w-fit max-h-screen">
      <DialogHeader>
        <DialogTitle>Portfolio Statistics</DialogTitle>
        <DialogDescription>
          We've calculated statistics for your portfolio:
        </DialogDescription>
        <div className="border p-4 rounded-lg flex flex-col gap-4 ">
            {getStatisticsQuery.isLoading && <Spinner/>}
            {getStatisticsQuery.error && <p>Error fetching data</p>}
            {getStatisticsQuery.data && (
              <div className="mx-4 my-2">
                <div className="mb-2">
                  <Label>Time Period</Label>
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
                </div>
                <div className="flex flex-row gap-4">
                  <div className="">
                    <span className="text-lg font-semibold">Coefficient of Variance & Beta</span>
                    <DataTable data={getStatisticsQuery.data?.coeff_and_beta} columns={coeff_and_beta_columns} />
                  </div>
                  <div className="">
                    <span className="text-lg font-semibold">Covariance/Correlation Matrix</span>
                    <DataTable 
                      columns={columns}
                      data={pivotedData}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}