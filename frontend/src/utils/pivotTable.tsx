import { ColumnDef } from "@tanstack/react-table"

type MatrixEntry = {
  stock_a: string
  stock_b: string
  correlation: number
}

type PivotedRow = {
  stock: string
  [key: string]: string | number | null
}

export function pivotCorrelationMatrix(matrix: MatrixEntry[]): PivotedRow[] {
  const stocksSet = new Set<string>()

  matrix.forEach(({ stock_a, stock_b }) => {
    stocksSet.add(stock_a)
    stocksSet.add(stock_b)
  })

  const stocks = Array.from(stocksSet).sort()

  // Create initial empty map
  const correlationMap: Record<string, Record<string, number | null>> = {}

  for (const stock of stocks) {
    correlationMap[stock] = {}
    for (const other of stocks) {
      correlationMap[stock][other] = stock === other ? null : 0
    }
  }

  // Fill the known correlations (symmetric)
  for (const { stock_a, stock_b, correlation } of matrix) {
    correlationMap[stock_a][stock_b] = correlation
    correlationMap[stock_b][stock_a] = correlation
  }

  // Format into pivoted rows
  const rows: PivotedRow[] = stocks.map((stock) => ({
    stock,
    ...correlationMap[stock],
  }))

  return rows
}


export function generateCorrelationColumns(stocks: string[]): ColumnDef<PivotedRow>[] {
  return [
    {
      accessorKey: "stock",
      header: "",
      cell: ({ row }) => <strong>{row.getValue("stock")}</strong>,
    },
    ...stocks.map((stock) => ({
      accessorKey: stock,
      header: stock,
      cell: ({ row }) => {
        const value = row.getValue(stock)
        return value === null
          ? "-"
          : typeof value === "number"
          ? value.toFixed(2)
          : ""
      },
    })),
  ]
}

