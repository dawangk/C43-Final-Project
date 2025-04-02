import { Flame } from "lucide-react";

const Logo = () => {

  return (
    <>
      <div className="p-2 flex gap-2 items-center font-medium">
        <div className="rounded-lg text-orange-600">
          <Flame fill="true" className="fill-orange-500"/>
        </div>

        <div className="flex items-center gap-1">
          <div className="text-orange-500">Stock Trader</div>
        </div>
      </div>
    </>
  );
};

export default Logo;
