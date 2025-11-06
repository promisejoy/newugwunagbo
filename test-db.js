const mysql = require('mysql2/promise');

async function testDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Comped@12345',
            database: 'ugwunagbo'
        });

        console.log('✅ Database connected successfully!');

        // Check if tables exist
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE table_schema = 'ugwunagbo'
        `);
        
        console.log('📊 Tables found:', tables.map(t => t.TABLE_NAME));

        // Check support_requests table
        try {
            const [supportData] = await connection.execute('SELECT * FROM support_requests LIMIT 5');
            console.log(`📋 Support requests: ${supportData.length} records`);
        } catch (e) {
            console.log('❌ Support requests table not found or empty');
        }

        // Check villages table
        try {
            const [villageData] = await connection.execute('SELECT * FROM villages LIMIT 5');
            console.log(`🏡 Villages: ${villageData.length} records`);
        } catch (e) {
            console.log('❌ Villages table not found or empty');
        }

        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testDatabase();