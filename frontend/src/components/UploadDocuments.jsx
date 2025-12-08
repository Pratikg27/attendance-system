import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UploadDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('Resume');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/my-documents');
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setMessage({ text: '❌ File size must be less than 5MB', type: 'error' });
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setMessage({ text: '', type: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({ text: '❌ Please select a file', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ text: '✅ Document uploaded successfully!', type: 'success' });
        setFile(null);
        setDocumentType('Resume');
        document.getElementById('file-input').value = '';
        fetchDocuments();
      }
    } catch (error) {
      setMessage({
        text: '❌ ' + (error.response?.data?.message || 'Error uploading document'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

 const handleDelete = async (documentId) => {
  if (!window.confirm('Are you sure you want to delete this document?')) {
    return;
  }

  try {
    const response = await api.delete(`/documents/${documentId}`);
    if (response.data.success) {
      setMessage({ text: '✅ Document deleted successfully', type: 'success' });
      fetchDocuments();
    }
  } catch {
    setMessage({ text: '❌ Error deleting document', type: 'error' });
  }
};

  const handleDownload = async (documentId, documentName) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setMessage({ text: '❌ Error downloading document', type: 'error' });
    }
  };

  // formatFileSize helper removed because it was unused

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 My Documents</h2>

      {message.text && (
        <div style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
          {message.text}
        </div>
      )}

      <div style={styles.uploadSection}>
        <h3 style={styles.sectionTitle}>Upload New Document</h3>
        <form onSubmit={handleUpload} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={styles.select}
              required
            >
              <option value="Resume">Resume</option>
              <option value="ID Proof">ID Proof</option>
              <option value="Address Proof">Address Proof</option>
              <option value="Education Certificate">Education Certificate</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Choose File</label>
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={styles.fileInput}
              required
            />
            <small style={styles.helpText}>Allowed: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</small>
          </div>

          <button type="submit" style={styles.uploadBtn} disabled={loading}>
            {loading ? '⏳ Uploading...' : '📤 Upload Document'}
          </button>
        </form>
      </div>

      <div style={styles.documentsList}>
        <h3 style={styles.sectionTitle}>Uploaded Documents ({documents.length})</h3>

        {documents.length === 0 ? (
          <p style={styles.noDocuments}>No documents uploaded yet.</p>
        ) : (
          <div style={styles.grid}>
          {documents.map((doc) => (
  <div key={doc.id} style={styles.card}>
    <div style={styles.icon}>📄</div>
    <div style={styles.docInfo}>
      <h4 style={styles.docName}>{doc.filename}</h4>
      <h4 style={styles.docName}>{doc.document_type}</h4>
      <p style={styles.docDate}>
        {new Date(doc.uploaded_at).toLocaleDateString()}
      </p>
    </div>
    <div style={styles.actions}>
      <button
        onClick={() => handleDownload(doc.id, doc.filename)}
        style={styles.downloadBtn}
        title="Download"
      >
        ⬇️ Download
      </button>
      <button
        onClick={() => handleDelete(doc.id)}
        style={styles.deleteBtn}
        title="Delete"
      >
        🗑️ Delete
      </button>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '28px'
  },
  successMessage: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    fontWeight: '500'
  },
  errorMessage: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    fontWeight: '500'
  },
  uploadSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '20px'
  },
  form: {
    maxWidth: '600px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#2c3e50',
    fontWeight: '500',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  },
  uploadBtn: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  documentsList: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  noDocuments: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontSize: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  icon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '15px'
  },
  docInfo: {
    marginBottom: '15px'
  },
  docName: {
    color: '#2c3e50',
    fontSize: '16px',
    marginBottom: '8px',
    wordBreak: 'break-word'
  },
  docType: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px'
  },
  docSize: {
    color: '#666',
    fontSize: '12px',
    margin: '3px 0'
  },
  docDate: {
    color: '#666',
    fontSize: '12px',
    margin: '3px 0'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  downloadBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  deleteBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  }
};

export default UploadDocuments;