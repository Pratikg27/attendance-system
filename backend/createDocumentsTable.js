const db = require('./config/database');

async function createDocumentsTable() {
  try {
    // First, drop the table if it exists
    await db.query('DROP TABLE IF EXISTS documents');
    console.log('🗑️ Dropped old documents table if existed');

    // Create table without foreign key
    const query = `
      CREATE TABLE documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_employee_id (employee_id)
      )
    `;

    await db.query(query);
    console.log('✅ Documents table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createDocumentsTable();