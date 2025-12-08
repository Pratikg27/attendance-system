const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
filename: (req, file, cb) => {
  const timestamp = Date.now();
  const randomNum = Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const uniqueName = `doc-${timestamp}-${randomNum}${extension}`;
  cb(null, uniqueName);
}
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentType = req.body.documentType || req.body.document_type;
    const employeeId = req.user.id;
    const filePath = `/uploads/${req.file.filename}`;

    // Use Sequelize's query method correctly
    const query = `INSERT INTO documents (employee_id, document_type, filename, file_path, uploaded_at) VALUES (?, ?, ?, ?, NOW())`;
    
    await db.query(query, {
      replacements: [employeeId, documentType, req.file.originalname, filePath],
      type: db.QueryTypes.INSERT
    });

    console.log('✅ Document uploaded successfully');
    res.json({ 
  success: true,
  message: 'Document uploaded successfully', 
  filePath 
});

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Get my documents
router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    console.log('📄 Fetching documents for employee:', req.user.id);

    const query = `SELECT id, document_type, filename, file_path, uploaded_at FROM documents WHERE employee_id = ? ORDER BY uploaded_at DESC`;

    const documents = await db.query(query, {
      replacements: [req.user.id],
      type: db.QueryTypes.SELECT
    });

    console.log('✅ Documents found:', documents.length);
    res.json({
  success: true,
  documents: documents
});

  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id;
    const employeeId = req.user.id;

    console.log('🗑️ Deleting document:', documentId);

    // Check if document belongs to user
    const selectQuery = `SELECT * FROM documents WHERE id = ? AND employee_id = ?`;
    const document = await db.query(selectQuery, {
      replacements: [documentId, employeeId],
      type: db.QueryTypes.SELECT
    });

    if (document.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Delete from database
    const deleteQuery = `DELETE FROM documents WHERE id = ?`;
    await db.query(deleteQuery, {
      replacements: [documentId],
      type: db.QueryTypes.DELETE
    });

    // Delete file from filesystem
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', document[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log('✅ Document deleted');
    res.json({ 
      success: true,
      message: 'Document deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting document', 
      error: error.message 
    });
  }
});
// Download document
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const documentId = req.params.id;
    const employeeId = req.user.id;

    console.log('📥 Downloading document:', documentId);

    // Get document info
    const selectQuery = `SELECT * FROM documents WHERE id = ? AND employee_id = ?`;
    const document = await db.query(selectQuery, {
      replacements: [documentId, employeeId],
      type: db.QueryTypes.SELECT
    });

    if (document.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Send file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', document[0].file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, document[0].filename);

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ message: 'Error downloading document', error: error.message });
  }
});
module.exports = router;