// frontend/components/AdminCronPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminCronPanel = () => {
  const [loading, setLoading] = useState('');
  const [results, setResults] = useState(null);
  const [lastExecuted, setLastExecuted] = useState({});
  const [loadingLastExecuted, setLoadingLastExecuted] = useState(true);

  // Load last execution times from database on component mount
  useEffect(() => {
    fetchLastExecutedTimes();
  }, []);

  const fetchLastExecutedTimes = async () => {
    try {
      setLoadingLastExecuted(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/last-executed`);
      console.log('Last executed data:', response.data);
      
      if (response.data.success) {
        setLastExecuted(response.data.lastExecuted);
      }
    } catch (error) {
      console.error('Error fetching last executed times:', error);
    } finally {
      setLoadingLastExecuted(false);
    }
  };

  // Map frontend action names to backend database action names
  const getBackendActionName = (frontendAction) => {
    const actionMap = {
      'cleanup': 'manual_cleanup',
      'daily-check': 'manual_daily_check', 
      'monthly-deduction': 'manual_monthly_deduction',
      'all': 'run_all_cron_jobs'
    };
    return actionMap[frontendAction];
  };

  const canExecute = (frontendAction) => {
    const backendAction = getBackendActionName(frontendAction);
    console.log(`Checking ${frontendAction} -> ${backendAction}:`, lastExecuted[backendAction]);
    
    if (!lastExecuted[backendAction]) return true;
    
    const lastExecution = new Date(lastExecuted[backendAction]);
    const now = new Date();
    const hoursSinceLastExecution = (now - lastExecution) / (1000 * 60 * 60);
    console.log(`Hours since last execution: ${hoursSinceLastExecution}`);
    
    return hoursSinceLastExecution >= 24;
  };

  const getTimeRemaining = (frontendAction) => {
    const backendAction = getBackendActionName(frontendAction);
    if (!lastExecuted[backendAction]) return null;
    
    const lastExecution = new Date(lastExecuted[backendAction]);
    const now = new Date();
    const hoursSinceLastExecution = (now - lastExecution) / (1000 * 60 * 60);
    const hoursRemaining = 24 - hoursSinceLastExecution;
    
    if (hoursRemaining <= 0) return null;
    
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);
    
    return { hours, minutes };
  };

  const triggerAction = async (frontendAction) => {
    console.log(`Triggering action: ${frontendAction}`);
    console.log(`Can execute: ${canExecute(frontendAction)}`);
    
    if (!canExecute(frontendAction)) {
      const timeRemaining = getTimeRemaining(frontendAction);
      setResults({ 
        success: false, 
        error: `⏳ This action was executed recently. Please wait ${timeRemaining?.hours || 0}h ${timeRemaining?.minutes || 0}m before running again.` 
      });
      return;
    }

    setLoading(frontendAction);
    setResults(null);
    
    try {
      // Use the correct endpoint names
      let endpoint;
      if (frontendAction === 'all') {
        endpoint = 'run-all';
      } else {
        endpoint = `manual-${frontendAction}`;
      }
      
      console.log(`🔄 Calling API: ${API_BASE_URL}/api/admin/${endpoint}`);
      
      const response = await axios.post(`${API_BASE_URL}/api/admin/${endpoint}`);
      setResults(response.data);
      
      // Refresh last executed times after successful execution
      if (response.data.success) {
        setTimeout(() => {
          fetchLastExecutedTimes();
        }, 1000);
      }
    } catch (error) {
      console.error('API Error:', error);
      setResults({ 
        success: false, 
        error: error.response?.data?.error || error.message || 'Network error - check if backend is running'
      });
    } finally {
      setLoading('');
    }
  };

  const buttons = [
    { 
      id: 'cleanup', 
      label: 'Run Cleanup', 
      color: '#dc3545', 
      description: 'Delete quiz history older than 45 days',
      icon: '🗑️'
    },
    { 
      id: 'daily-check', 
      label: 'Run Daily Check', 
      color: '#ffc107', 
      description: 'Deduct 1 from day_count for all users',
      icon: '📅'
    },
    { 
      id: 'monthly-deduction', 
      label: 'Run Monthly Deduction', 
      color: '#fd7e14', 
      description: 'Process maintenance fees',
      icon: '💰'
    },
    { 
      id: 'all', 
      label: 'Run All Jobs', 
      color: '#28a745', 
      description: 'Execute all jobs at once',
      icon: '🚀'
    }
  ];

  if (loadingLastExecuted) {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        color: 'white',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Loading cron job status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-cron-panel" style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      color: 'white',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '0px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '26px',
          background: 'linear-gradient(45deg, #fff, #a8a8a8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Manual Cron Job Triggers
        </h2>
        <button 
          onClick={fetchLastExecutedTimes}
          disabled={loadingLastExecuted}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            cursor: loadingLastExecuted ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loadingLastExecuted ? 0.6 : 1
          }}
        >
          {loadingLastExecuted ? '🔄' : '🔄'} Refresh Status
        </button>
      </div>
      
      {/* Buttons in One Line */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {buttons.map((button) => {
          const isDisabled = !canExecute(button.id);
          const timeRemaining = getTimeRemaining(button.id);
          const isCurrentlyLoading = loading === button.id;
          
          return (
            <div key={button.id} style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              opacity: (isDisabled && !isCurrentlyLoading) ? 0.6 : 1,
              minWidth: '150px',
              flex: '1',
              maxWidth: '280px'
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px'
              }}>
                {/* Icon */}
                <div style={{
                  fontSize: '32px',
                  padding: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (isDisabled && !isCurrentlyLoading) ? 0.5 : 1
                }}>
                  {button.icon}
                </div>
                
                {/* Title and Status */}
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      color: (isDisabled && !isCurrentlyLoading) ? '#888' : 'white',
                      fontWeight: '600'
                    }}>
                      {button.label}
                    </h3>
                    {isDisabled && timeRemaining && (
                      <span style={{
                        background: 'rgba(255,193,7,0.2)',
                        color: '#ffc107',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        COOLDOWN
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p style={{ 
                    color: (isDisabled && !isCurrentlyLoading) ? '#666' : '#b0b0b0', 
                    margin: '0 0 15px 0',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    minHeight: '35px'
                  }}>
                    {button.description}
                  </p>
                  
                  {/* Time Remaining */}
                  {timeRemaining && isDisabled && (
                    <div style={{
                      background: 'rgba(255,193,7,0.1)',
                      border: '1px solid rgba(255,193,7,0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#ffc107',
                        fontWeight: '500'
                      }}>
                        ⏰ {timeRemaining.hours}h {timeRemaining.minutes}m
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => triggerAction(button.id)}
                    disabled={isDisabled || isCurrentlyLoading}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: (isDisabled || isCurrentlyLoading) ? 'not-allowed' : 'pointer',
                      backgroundColor: isDisabled ? '#6c757d' : button.color,
                      color: 'white',
                      fontWeight: 'bold',
                      width: '100%',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      opacity: (isDisabled || isCurrentlyLoading) ? 0.6 : 1,
                    }}
                  >
                    {isCurrentlyLoading ? (
                      <span>🔄 Running...</span>
                    ) : isDisabled ? (
                      <span>⏳ Cooldown</span>
                    ) : (
                      <span>Run Now</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Section */}
      {results && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          backgroundColor: results.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${results.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: results.success ? '#bbf7d0' : '#fecaca',
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '18px'
          }}>
            {results.success ? '✅ Success' : '❌ Error'}
          </h4>
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {results.message || results.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCronPanel;