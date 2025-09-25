import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header: fixed at top */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: fixed height to fill remaining viewport below header */}
        <div className="flex-shrink-0 h-full">
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Main content: scrollable only */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};