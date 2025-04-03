import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
interface StockListTableProps {
  data: any
}

export const StockListTable = ({
  data
}: StockListTableProps) => {

  return (
    <div>
      <DataTable data={data} columns={columns}/>
    </div>
  )
}