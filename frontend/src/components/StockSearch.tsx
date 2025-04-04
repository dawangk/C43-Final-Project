import { useClickOutside } from "@/hooks/useClickOutside";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";
import { useDebounceValue } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { getStocks } from "@/api/stockApiSlice";
import { Spinner } from "./ui/spinner";
import { Stock } from "@/models/db-models";

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  autoFocus?: boolean;
}

export const StockSearch = ({
  onSelect,
  autoFocus = false
}: StockSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounceValue(search, 250);
  useClickOutside(panelRef as React.RefObject<HTMLDivElement>, () => setShowPanel(false), showPanel, inputRef as React.RefObject<HTMLInputElement>);
  const getStocksQuery = useQuery({
    queryKey: ["stocks", debouncedSearch],
    queryFn: () => getStocks(debouncedSearch),
  })

  useEffect(() => {
    if (search) {
      getStocksQuery.refetch();
    }
  }, [debouncedSearch]);

  // Only apply focus if explicitly requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Add a slight delay to avoid conflicts with Dialog's own focus management
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <Input
        type="text"
        ref={inputRef}
        value={search}
        placeholder="Search..."
        className="pl-10"
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setShowPanel(true)}
        autoFocus={false}
      />
      {showPanel &&  (
        <div
          ref={panelRef}
          className="absolute top-full left-0 w-full bg-white shadow-md border rounded-md mt-2 z-[100] max-h-[500px] overflow-y-auto"
        >
          {getStocksQuery.isLoading ? (
            <Spinner />
          ) : (
            <div>
              {getStocksQuery.data && getStocksQuery.data.map((stock: Stock) => (
                <div 
                  key={stock.symbol} 
                  className="hover:bg-gray-100 p-1 text-black pl-2" 
                  onClick={() => { 
                    onSelect(stock.symbol)
                    setShowPanel(false)
                  }}
                >
                  {stock.symbol}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}