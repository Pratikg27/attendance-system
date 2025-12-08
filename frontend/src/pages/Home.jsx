import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    floatingShapes: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    },
    shape: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      animation: 'float 20s infinite ease-in-out'
    },
    navbar: {
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      boxShadow: scrolled ? '0 8px 32px rgba(0, 0, 0, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    },
    navContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '85px'
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    },
    logoIcon: {
      width: '55px',
      height: '55px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
      animation: 'pulse 2s infinite',
      transition: 'transform 0.3s ease'
    },
    logoText: {
      fontSize: '2rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.5px'
    },
    navButtons: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    btnOutline: {
      padding: '0.875rem 2rem',
      color: '#667eea',
      fontWeight: '700',
      border: '3px solid #667eea',
      borderRadius: '15px',
      background: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '1rem',
      position: 'relative',
      overflow: 'hidden'
    },
    btnGradient: {
      padding: '0.875rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: '700',
      borderRadius: '15px',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '1rem',
      position: 'relative',
      overflow: 'hidden'
    },
    hero: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '6rem 2rem',
      position: 'relative',
      zIndex: 1
    },
    heroContent: {
      textAlign: 'center',
      marginBottom: '6rem',
      animation: 'fadeInUp 1s ease-out'
    },
    heroTitle: {
      fontSize: '4.5rem',
      fontWeight: '900',
      color: 'white',
      lineHeight: '1.1',
      marginBottom: '2rem',
      textShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
      letterSpacing: '-1px'
    },
    heroGradientText: {
      background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline-block',
      animation: 'shimmer 3s infinite'
    },
    heroSubtitle: {
      fontSize: '1.75rem',
      color: 'rgba(255, 255, 255, 0.95)',
      maxWidth: '900px',
      margin: '0 auto',
      lineHeight: '1.8',
      textShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: '500'
    },
    portalGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '3rem',
      marginBottom: '6rem'
    },
    portalCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '32px',
      padding: '3rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    cardGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
      opacity: 0,
      transition: 'opacity 0.5s ease'
    },
    portalIcon: {
      width: '100px',
      height: '100px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '2rem',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
      fontSize: '3rem',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      zIndex: 1
    },
    iconBlue: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    iconPurple: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    portalTitle: {
      fontSize: '2.25rem',
      fontWeight: '900',
      color: '#1a1a2e',
      marginBottom: '1.25rem',
      position: 'relative',
      zIndex: 1
    },
    portalDescription: {
      color: '#6B7280',
      fontSize: '1.25rem',
      lineHeight: '1.8',
      marginBottom: '2.5rem',
      position: 'relative',
      zIndex: 1
    },
    portalBtn: {
      width: '100%',
      padding: '1.25rem 2.5rem',
      borderRadius: '16px',
      fontWeight: '800',
      fontSize: '1.25rem',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      color: 'white',
      cursor: 'pointer',
      border: 'none',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 1
    },
    btnBlue: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    btnPurple: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    features: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '32px',
      padding: '4rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      marginBottom: '6rem'
    },
    featuresTitle: {
      fontSize: '3rem',
      fontWeight: '900',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '5rem'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '3.5rem'
    },
    featureItem: {
      textAlign: 'center',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    featureIcon: {
      width: '110px',
      height: '110px',
      borderRadius: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 2rem',
      fontSize: '3.5rem',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    iconGreen: {
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    iconYellow: {
      background: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)'
    },
    iconRed: {
      background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
    },
    featureTitle: {
      fontSize: '1.75rem',
      fontWeight: '800',
      color: '#1a1a2e',
      marginBottom: '1rem'
    },
    featureDescription: {
      color: '#6B7280',
      fontSize: '1.125rem',
      lineHeight: '1.8'
    },
    footer: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: '4rem 2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    footerTitle: {
      fontSize: '2rem',
      fontWeight: '900',
      marginBottom: '0.75rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    footerText: {
      color: '#9CA3AF',
      fontSize: '1.125rem',
      fontWeight: '500'
    }
  };

  const handleCardHover = (e, isEntering) => {
    const card = e.currentTarget;
    if (isEntering) {
      card.style.transform = 'translateY(-20px) scale(1.03)';
      card.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.25)';
      card.querySelector('.card-glow').style.opacity = '1';
      card.querySelector('.portal-icon').style.transform = 'scale(1.15) rotate(10deg)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
      card.querySelector('.card-glow').style.opacity = '0';
      card.querySelector('.portal-icon').style.transform = 'scale(1) rotate(0deg)';
    }
  };

  const handleFeatureHover = (e, isEntering) => {
    const item = e.currentTarget;
    if (isEntering) {
      item.style.transform = 'translateY(-15px) scale(1.08)';
      item.querySelector('.feature-icon').style.transform = 'scale(1.2) rotate(-10deg)';
      item.querySelector('.feature-icon').style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
    } else {
      item.style.transform = 'translateY(0) scale(1)';
      item.querySelector('.feature-icon').style.transform = 'scale(1) rotate(0deg)';
      item.querySelector('.feature-icon').style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
    }
  };

  const handleButtonHover = (e, isEntering, isGradient) => {
    if (isEntering) {
      if (isGradient) {
        e.target.style.transform = 'translateY(-3px) scale(1.05)';
        e.target.style.boxShadow = '0 16px 40px rgba(102, 126, 234, 0.6)';
      } else {
        e.target.style.background = '#667eea';
        e.target.style.color = 'white';
        e.target.style.transform = 'translateY(-3px) scale(1.05)';
      }
    } else {
      if (isGradient) {
        e.target.style.transform = 'translateY(0) scale(1)';
        e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
      } else {
        e.target.style.background = 'transparent';
        e.target.style.color = '#667eea';
        e.target.style.transform = 'translateY(0) scale(1)';
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(5deg); }
          50% { transform: translateY(-60px) rotate(-5deg); }
          75% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>

      <div style={styles.page}>
        {/* Floating Shapes Background */}
        <div style={styles.floatingShapes}>
          <div style={{...styles.shape, width: '300px', height: '300px', top: '10%', left: '5%', animationDelay: '0s'}}></div>
          <div style={{...styles.shape, width: '200px', height: '200px', top: '60%', right: '10%', animationDelay: '3s'}}></div>
          <div style={{...styles.shape, width: '250px', height: '250px', bottom: '10%', left: '15%', animationDelay: '6s'}}></div>
          <div style={{...styles.shape, width: '180px', height: '180px', top: '30%', right: '20%', animationDelay: '9s'}}></div>
        </div>

        {/* Navbar */}
        <nav style={styles.navbar}>
          <div style={styles.navContainer}>
            <div 
              style={styles.logoWrapper}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.querySelector('.logo-icon').style.transform = 'rotate(360deg) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.querySelector('.logo-icon').style.transform = 'rotate(0deg) scale(1)';
              }}
            >
              <div className="logo-icon" style={styles.logoIcon}>
                <span style={{ color: 'white', fontSize: '1.75rem' }}>⏰</span>
              </div>
              <h1 style={styles.logoText}>AttendFlow</h1>
            </div>
            <div style={styles.navButtons}>
              <button
                style={styles.btnOutline}
                onClick={() => navigate('/employee-login')}
                onMouseEnter={(e) => handleButtonHover(e, true, false)}
                onMouseLeave={(e) => handleButtonHover(e, false, false)}
              >
                Employee Login
              </button>
              <button
                style={styles.btnGradient}
                onClick={() => navigate('/admin-login')}
                onMouseEnter={(e) => handleButtonHover(e, true, true)}
                onMouseLeave={(e) => handleButtonHover(e, false, true)}
              >
                Admin Login
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>
              Employee Attendance &<br />
              <span style={styles.heroGradientText}>Payroll System</span>
            </h2>
            <p style={styles.heroSubtitle}>
              Manage attendance, track hours, and process payroll with stunning efficiency
            </p>
          </div>

          {/* Portal Cards */}
          <div style={styles.portalGrid}>
            {/* Employee Portal */}
            <div 
              style={styles.portalCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="card-glow" style={styles.cardGlow}></div>
              <div className="portal-icon" style={{ ...styles.portalIcon, ...styles.iconBlue }}>
                <span>👤</span>
              </div>
              <h3 style={styles.portalTitle}>🌟 Employee Portal</h3>
              <p style={styles.portalDescription}>
                Clock in/out seamlessly, view your attendance history, and track your hours in real-time
              </p>
              <button
                style={{ ...styles.portalBtn, ...styles.btnBlue }}
                onClick={() => navigate('/employee-login')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.02)';
                  e.target.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
                }}
              >
                Login as Employee →
              </button>
            </div>

            {/* Admin Portal */}
            <div 
              style={styles.portalCard}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="card-glow" style={styles.cardGlow}></div>
              <div className="portal-icon" style={{ ...styles.portalIcon, ...styles.iconPurple }}>
                <span>⚙️</span>
              </div>
              <h3 style={styles.portalTitle}>🚀 Admin Portal</h3>
              <p style={styles.portalDescription}>
                Manage employees effortlessly, process payroll instantly, and view comprehensive reports
              </p>
              <button
                style={{ ...styles.portalBtn, ...styles.btnPurple }}
                onClick={() => navigate('/admin-login')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.02)';
                  e.target.style.boxShadow = '0 20px 50px rgba(240, 147, 251, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
                }}
              >
                Login as Admin →
              </button>
            </div>
          </div>

          {/* Features */}
          <div style={styles.features}>
            <h3 style={styles.featuresTitle}>✨ Powerful Features</h3>
            <div style={styles.featuresGrid}>
              <div 
                style={styles.featureItem}
                onMouseEnter={(e) => handleFeatureHover(e, true)}
                onMouseLeave={(e) => handleFeatureHover(e, false)}
              >
                <div className="feature-icon" style={{ ...styles.featureIcon, ...styles.iconGreen }}>
                  <span>⏰</span>
                </div>
                <h4 style={styles.featureTitle}>Real-time Tracking</h4>
                <p style={styles.featureDescription}>
                  Track clock in/out times with military-grade precision
                </p>
              </div>

              <div 
                style={styles.featureItem}
                onMouseEnter={(e) => handleFeatureHover(e, true)}
                onMouseLeave={(e) => handleFeatureHover(e, false)}
              >
                <div className="feature-icon" style={{ ...styles.featureIcon, ...styles.iconYellow }}>
                  <span>💰</span>
                </div>
                <h4 style={styles.featureTitle}>Automated Payroll</h4>
                <p style={styles.featureDescription}>
                  Calculate wages automatically with zero errors
                </p>
              </div>

              <div 
                style={styles.featureItem}
                onMouseEnter={(e) => handleFeatureHover(e, true)}
                onMouseLeave={(e) => handleFeatureHover(e, false)}
              >
                <div className="feature-icon" style={{ ...styles.featureIcon, ...styles.iconRed }}>
                  <span>📊</span>
                </div>
                <h4 style={styles.featureTitle}>Detailed Reports</h4>
                <p style={styles.featureDescription}>
                  Comprehensive analytics and actionable insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <h3 style={styles.footerTitle}>AttendFlow</h3>
          <p style={styles.footerText}>© 2024 AttendFlow. Crafted with passion. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Home;