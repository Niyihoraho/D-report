"use client"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { useEffect } from "react"

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    description?: string
    autoClose?: boolean
    duration?: number
}

export function SuccessModal({
    isOpen,
    onClose,
    title = "Success!",
    description = "Operation completed successfully.",
    autoClose = true,
    duration = 2000
}: SuccessModalProps) {

    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isOpen, autoClose, duration, onClose])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[320px] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white dark:bg-[#1F2128] p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center w-full relative overflow-hidden"
                        >
                            <DialogTitle className="sr-only">{title}</DialogTitle>
                            <DialogDescription className="sr-only">{description}</DialogDescription>

                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-500/10 pointer-events-none" />

                            <div className="relative mb-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.1
                                    }}
                                    className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30"
                                >
                                    <Check className="w-8 h-8 stroke-[3]" />
                                </motion.div>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                    className="absolute inset-0 rounded-full border-2 border-green-500"
                                />
                            </div>

                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-[#11142D] dark:text-white mb-2"
                            >
                                {title}
                            </motion.h2>

                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-sm text-gray-500 dark:text-gray-400"
                            >
                                {description}
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
