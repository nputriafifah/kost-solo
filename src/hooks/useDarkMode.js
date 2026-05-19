// hooks/useDarkMode.js
import { useState, useEffect } from "react";
export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("atap_theme") === "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("atap_theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return [darkMode, setDarkMode];
}