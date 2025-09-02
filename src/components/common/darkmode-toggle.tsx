"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DarkmodeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full p-1 flex items-center cursor-pointer shadow-md"
        >
            <motion.div
                className="absolute w-6 h-6 bg-white rounded-full flex items-center justify-center shadow"
                animate={{ x: isDark ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            >
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="h-4 w-4 text-black" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="h-4 w-4 text-black" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    );
}
