import { DataTable } from "@/components/data-table"
import { stockListColumns } from "./columns"
interface StockListTableProps {
  data: any
}

export const StockListTable = ({
  data
}: StockListTableProps) => {

  return (
    <div>
      <DataTable data={data} columns={stockListColumns}/>
    </div>
  )
}