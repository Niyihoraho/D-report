
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const workspaces = await prisma.workspace.findMany({
        select: {
            id: true,
            name: true,
            slug: true
        }
    })

    console.log("All workspaces:", JSON.stringify(workspaces, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
