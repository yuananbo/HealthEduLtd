import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/router";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <ThemeProvider>
            <SidebarProvider>
              <AppRoutes />
            </SidebarProvider>
          </ThemeProvider>
        </UserProvider>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 8000,
          },
          className: "text-base max-w-md py-4 px-6 bg-gray-50 text-gray-700",
        }}
      />
    </>
  );
}

export default App;
