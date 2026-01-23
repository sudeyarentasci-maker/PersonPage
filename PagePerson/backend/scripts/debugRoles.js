import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb+srv://Emre:741852963ei@cluster0.mz4m6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

// Database Name
const dbName = 'person-page';

async function main() {
    try {
        // Use connect method to connect to the server
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);

        // 1. List all Roles
        console.log('\n--- ROLES ---');
        const roles = await db.collection('roles').find({}).toArray();
        roles.forEach(role => {
            console.log(`ID: ${role._id}, Name: ${role.name}`);
        });

        // 2. List all User Roles
        console.log('\n--- USER ROLES (Sample) ---');
        const userRoles = await db.collection('user_roles').find({}).limit(10).toArray();
        console.log(userRoles);

        // 3. Find Users with "MANAGER" Role (by Name Lookup)
        console.log('\n--- USERS WITH MANAGER ROLE (Manual Join) ---');
        const managerRole = roles.find(r => r.name === 'MANAGER');
        if (managerRole) {
            console.log(`Manager Role ID Found: ${managerRole._id}`);
            const managerRelations = await db.collection('user_roles').find({ roleId: managerRole._id }).toArray();
            console.log(`Found ${managerRelations.length} manager relations.`);

            for (const rel of managerRelations) {
                const user = await db.collection('users').findOne({ userId: rel.userId });
                console.log(` - User: ${user ? user.email : 'Unknown'} (ID: ${rel.userId})`);
            }
        } else {
            console.log('MANAGER role not found in roles collection!');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

main();
