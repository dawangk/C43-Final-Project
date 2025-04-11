import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";
import { Separator } from "@radix-ui/react-separator";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { StockListPage } from "../StockLists/StockListPage";
import { ViewStockListPage } from "../StockLists/ViewStockListPage";
import { PortfoliosPage } from "../Portfolios/PortfoliosPage";
import { ViewPortfolioPage } from "../Portfolios/ViewPortfolioPage";
import { StockPage } from "../Stocks/StockPage";
import { FriendsPage } from "../Friends/FriendsPage";
import { PublicStockListPage } from "../StockLists/PublicStockListPage";
import { SharedStockListPage } from "../Shared/SharedStockListPage";
import { ViewSharedStockListPage } from "../Shared/ViewSharedStockListPage";

export const Dashboard = () => {
  const location = useLocation();

  return (
    <>
        <div className="w-full">
          <div>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
                  <div className="flex flex-row items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                          {location.pathname === "/dashboard/home" ? (
                            <Link to="/dashboard/home">Home</Link>
                          ) : location.pathname.startsWith("/dashboard/stock-lists") ? (
                            <Link to="/dashboard/stock-lists">Stock Lists</Link>
                          ) : location.pathname.startsWith("/dashboard/portfolios") ? (
                            <Link to="/dashboard/portfolios">Portfolios</Link>
                          ) : (
                            <Link to={location.pathname}>Stock Info</Link>
                          )}
                        </BreadcrumbItem>
                        {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                        {/* <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem> */}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <div>
                    <UserMenu />
                  </div>
                </header>
                <div>
                  <Routes>
                    <Route path="*" element={<Navigate to="/not-found" />} />
                    <Route path="/" element={<Navigate to="home" replace />} />
                    <Route path="/home" element={<>Home</>} />
                    <Route path="/stock-lists" element={<StockListPage/>} />
                    <Route path="/stock-lists/:id" element={<ViewStockListPage />} />
                    <Route path="/shared" element={<SharedStockListPage/>} />
                    <Route path="/shared/:id" element={<ViewSharedStockListPage />} />
                    <Route path="/portfolios" element={<PortfoliosPage/>} />
                    <Route path="/portfolios/:id" element={<ViewPortfolioPage />} />
                    <Route path="stock/:symbol" element={<StockPage />}/>
                    <Route path="stock/:symbol/:id" element={<StockPage />}/>
                    <Route path="friends" element={<FriendsPage />}/>
                    <Route path="/public-lists" element={<PublicStockListPage />}/>
                    <Route path="/public-list/:id" element={<ViewSharedStockListPage />}/>
                  </Routes>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </div>
      </>
  );
};

export default Dashboard;
