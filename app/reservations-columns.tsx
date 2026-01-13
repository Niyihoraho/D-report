"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconArrowUpRight } from "@tabler/icons-react"
import { z } from "zod"

// Define the schema for reservation data
export const schema = z.object({
    id: z.number(),
    guestName: z.string(),
    email: z.string(),
    roomNumber: z.string(),
    roomType: z.string(),
    checkIn: z.string(),
    checkOut: z.string(),
    totalGuests: z.string(),
    status: z.string(),
    avatar: z.string().optional(),
})

export type Reservation = z.infer<typeof schema>

// Helper to get status badge styles
const getStatusStyles = (status: string) => {
    switch (status) {
        case "New":
            return "bg-[#E4D7FF] text-[#6C5DD3] hover:bg-[#E4D7FF]/80"
        case "Confirmed":
            return "bg-[#D6F3E0] text-[#27AE60] hover:bg-[#D6F3E0]/80"
        case "Checked In":
            return "bg-[#FFF4D9] text-[#F2994A] hover:bg-[#FFF4D9]/80"
        case "Checked Out":
            return "bg-[#DDF1FF] text-[#2F80ED] hover:bg-[#DDF1FF]/80"
        case "Completed":
            return "bg-[#E4E4E4] text-[#11142D] hover:bg-[#E4E4E4]/80"
        case "Cancelled":
            return "bg-[#FFE5E6] text-[#EB5757] hover:bg-[#FFE5E6]/80"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

export const columns: ColumnDef<Reservation>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-gray-300 data-[state=checked]:bg-[#6C5DD3] data-[state=checked]:border-[#6C5DD3]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-gray-300 data-[state=checked]:bg-[#6C5DD3] data-[state=checked]:border-[#6C5DD3]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Booking ID",
        cell: ({ row }) => <span className="font-medium text-[#11142D] dark:text-white">#{row.getValue("id")}</span>,
    },
    {
        accessorKey: "guestName",
        header: "Guest name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={row.original.avatar} alt={row.getValue("guestName") as string} />
                    <AvatarFallback>{(row.getValue("guestName") as string).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-[#11142D] dark:text-white">{row.getValue("guestName") as string}</span>
                    <span className="text-xs text-gray-500">{row.original.email}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "roomNumber",
        header: "Room number",
        cell: ({ row }) => <span className="text-[#11142D] dark:text-white">{row.getValue("roomNumber") as string}</span>,
    },
    {
        accessorKey: "roomType",
        header: "Room type",
        cell: ({ row }) => <span className="text-[#11142D] dark:text-white">{row.getValue("roomType") as string}</span>,
    },
    {
        accessorKey: "checkIn",
        header: "Checked In",
        cell: ({ row }) => <span className="text-[#11142D] dark:text-white">{row.getValue("checkIn") as string}</span>,
    },
    {
        accessorKey: "checkOut",
        header: "Checked Out",
        cell: ({ row }) => <span className="text-[#11142D] dark:text-white">{row.getValue("checkOut") as string}</span>,
    },
    {
        accessorKey: "totalGuests",
        header: "Total Guests",
        cell: ({ row }) => <span className="text-[#11142D] dark:text-white">{row.getValue("totalGuests") as string}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge className={`rounded-md px-3 py-1 font-medium border-none shadow-none ${getStatusStyles(status)}`}>
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: () => (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-[#2C2F36]">
                <IconArrowUpRight className="h-4 w-4 text-gray-500" />
            </Button>
        ),
    },
]
