import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import SuperAdminHeader from "./SuperAdminHeader";
import Backdrop from "./Backdrop";
import SuperAdminSidebar from "./SuperAdminSidebar";

const SuperAdminLayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <SuperAdminSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <SuperAdminHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const SuperAdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <SuperAdminLayoutContent />
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
