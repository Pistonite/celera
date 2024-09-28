import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import { I18nCeleraBackend } from "@pistonite/celera/i18next";
import { initDark } from "@pistonite/pure/pref";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";

// initialize dark mode state (provided by pure)
initDark();

// Celera has multiple supported languages.
// and a plugin for i18next.
// When using without i18next, it will use English
i18n.use(initReactI18next).use(I18nCeleraBackend).init({
    lng: "en",
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
);
