import api from '../api';

// Leave Management APIs
export const getLeaveBalance = () => api.get('/leaves/balance');
export const applyLeave = (data) => api.post('/leaves/apply', data);
export const getMyLeaves = () => api.get('/leaves/my-leaves');
export const getPendingLeaves = () => api.get('/leaves/pending');
export const updateLeaveStatus = (leaveId, data) => api.put(`/admin/leaves/update-status/${leaveId}`, data);

// Attendance APIs
export const getAttendanceRecords = (filters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.employeeId) params.append('employeeId', filters.employeeId);
  return api.get(`/admin/attendance?${params.toString()}`);
};

// Download Reports
export const downloadAttendanceExcel = (params) => 
  api.get(`/admin/attendance/download/excel?${params}`, { responseType: 'blob' });

export const downloadAttendancePDF = (params) => 
  api.get(`/admin/attendance/download/pdf?${params}`, { responseType: 'blob' });

export default api;