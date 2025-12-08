import { useState, useEffect } from 'react';
import { getLeaveBalance } from '../services/api';
import '../styles/Leave.css';

const LeaveBalance = () => {
  const [balance, setBalance] = useState({
    cl_balance: 0,
    sl_balance: 0,
    pl_balance: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
  try {
    console.log('🔄 Fetching leave balance...');
    const response = await getLeaveBalance();
    console.log('✅ Balance received:', response.data);
    setBalance(response.data);
    setLoading(false);
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    setLoading(false);
  }
};

    fetchBalance();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="leave-balance-container">
      <h2>📊 Your Leave Balance</h2>
      <div className="balance-cards">
        <div className="balance-card cl">
          <h3>Casual Leave (CL)</h3>
          <p className="balance-number">{balance.cl_balance}</p>
          <span>days remaining</span>
        </div>
        <div className="balance-card sl">
          <h3>Sick Leave (SL)</h3>
          <p className="balance-number">{balance.sl_balance}</p>
          <span>days remaining</span>
        </div>
        <div className="balance-card pl">
          <h3>Privilege Leave (PL)</h3>
          <p className="balance-number">{balance.pl_balance}</p>
          <span>days remaining</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;