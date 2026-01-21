
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const workspaceName = "thrive together in gbu"
    // Try to find by exact name or slug part
    const workspaces = await prisma.workspace.findMany()
    console.log("All workspaces:", workspaces.map(w => ({ id: w.id, name: w.name, slug: w.slug })))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
