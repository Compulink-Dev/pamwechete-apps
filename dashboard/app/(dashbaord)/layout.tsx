import React from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main className="">{children}</main>
    </div>
  );
}

export default DashboardLayout;
