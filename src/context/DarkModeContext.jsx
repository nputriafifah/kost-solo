import { createContext, useContext } from "react";
import { useDarkMode } from "../utils/DarkMode";

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
    const { darkMode, toggleDarkMode } = useDarkMode();
    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkModeContext() {
    return useContext(DarkModeContext);
}