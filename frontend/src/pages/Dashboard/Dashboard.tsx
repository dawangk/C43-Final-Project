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
                          ) : (
                            <></>
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
                    <Route path="/home" element={<></>} />
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
