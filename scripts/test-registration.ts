import { prisma } from '../lib/prisma';
// import fetch from 'node-fetch'; // This might cause ESM issues if not configured. 
// Using built-in fetch if Node 18+ or dynamic import.
// Assuming Node 18+ which has global fetch, but if not:
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


async function main() {
    console.log('Starting member registration test...');

    // 1. Get a workspace
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
        console.error('No workspace found to test with.');
        return;
    }
    console.log(`Using workspace: ${workspace.name} (${workspace.id})`);

    // 2. Prepare payload mimicking RegisterMemberDialog
    const payload = {
        profileData: {
            name: "Test User " + Date.now(),
            regionalName: "Test Region",
            email: `testuser${Date.now()}@example.com`,
            phone: "1234567890"
        },
        status: 'ACTIVE'
    };

    // 3. Call the API (assuming local dev server is running on port 3000)
    // Note: Since we are running this script, we can also just use Prisma to create it directly to verify the DB works,
    // but to test the API route logic (including anonymous user creation), we should ideally hit the endpoint.
    // However, hitting localhost:3000 from here requires the Next.js server to be running.
    // The user has 'npm run dev' running.

    try {
        const response = await fetch(`http://localhost:3000/api/workspaces/${workspace.id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`API Response Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Member registered successfully via API:', data);

            // 4. Verify in DB
            const member = await prisma.userWorkspaceRole.findUnique({
                where: { id: data.id },
                include: { user: true }
            });

            if (member) {
                console.log('Verification: Member found in database.');
                console.log(`- Member ID: ${member.id}`);
                console.log(`- User Email: ${member.user.email}`);
                console.log(`- Status: ${member.status}`);
            } else {
                console.error('Verification Failed: Member not found in database.');
            }
        } else {
            const errorText = await response.text();
            console.error('API Error:', errorText);
        }
    } catch (error) {
        console.error('Network/API Error. Is the server running on localhost:3000?', error);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
