import { Input } from "@/components/ui/input"
import { roundTo2Decimals } from "@/utils/round"
import { useState } from "react"

interface MoneyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
}

export function MoneyInput({ value, onChange, placeholder = "0.00" }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatMoney(value))

  function formatMoney(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function parseToNumber(val: string): number {
    const cleaned = val.replace(/[^0-9.]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const numberValue = parseToNumber(raw)
    setDisplayValue(raw)
    onChange(roundTo2Decimals(numberValue))
  }

  const handleBlur = () => {
    setDisplayValue(formatMoney(value))
  }

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="pl-7"
      />
    </div>
  )
}
