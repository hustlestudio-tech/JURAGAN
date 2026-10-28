import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/silkscreen";
import "@fontsource/nunito";
import "./styles.css";
import { App } from "./App";

const queryClient = new QueryClient();
const root = document.getElementById("root");
if (!root) throw new Error("#root tidak ditemukan");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
