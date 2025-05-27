import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { SidebarContext } from "@/context/SidebarContext";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";

export default function AppLayout() {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div>
        <Header />
      </div>
      <div style={{ display: "flex", flexDirection: "row", overflow: "auto" }}>
        {!isSidebarOpen && (
          <div>
            <Sidebar />
          </div>
        )}
        <div
          style={{
            marginLeft: !isSidebarOpen ? "240px" : "0px",
            flexGrow: 1,
            overscrollBehavior: "contain",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
