import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      padding: '0 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '75px'
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    },
    logoIcon: {
      width: '45px',
      height: '45px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
      animation: 'pulse 2s infinite',
      transition: 'transform 0.3s ease'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.5px'
    },
    navButtons: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center'
    },
    mobileMenuToggle: {
      display: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      width: '45px',
      height: '45px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease'
    },
    mobileMenu: {
      position: 'fixed',
      top: '75px',
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
      opacity: mobileMenuOpen ? 1 : 0,
      transition: 'all 0.3s ease',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    btnOutline: {
      padding: '0.75rem 1.75rem',
      color: '#667eea',
      fontWeight: '700',
      border: '3px solid #667eea',
      borderRadius: '12px',
      background: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '0.95rem',
      position: 'relative',
      overflow: 'hidden'
    },
    btnGradient: {
      padding: '0.75rem 1.75rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: '700',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '0.95rem',
      position: 'relative',
      overflow: 'hidden'
    },
    hero: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '4rem 1.5rem',
      position: 'relative',
      zIndex: 1
    },
    heroContent: {
      textAlign: 'center',
      marginBottom: '4rem',
      animation: 'fadeInUp 1s ease-out'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: '900',
      color: 'white',
      lineHeight: '1.2',
      marginBottom: '1.5rem',
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
      fontSize: '1.25rem',
      color: 'rgba(255, 255, 255, 0.95)',
      maxWidth: '800px',
      margin: '0 auto 2rem',
      lineHeight: '1.7',
      textShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: '500'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      maxWidth: '900px',
      margin: '0 auto 4rem',
      padding: '0 1rem'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '1.5rem',
      textAlign: 'center',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: '900',
      color: 'white',
      marginBottom: '0.5rem',
      textShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
    },
    statLabel: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600'
    },
    portalGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem'
    },
    portalCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      padding: '2.5rem',
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
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
      fontSize: '2.5rem',
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
      fontSize: '1.75rem',
      fontWeight: '900',
      color: '#1a1a2e',
      marginBottom: '1rem',
      position: 'relative',
      zIndex: 1
    },
    portalDescription: {
      color: '#6B7280',
      fontSize: '1.1rem',
      lineHeight: '1.7',
      marginBottom: '2rem',
      position: 'relative',
      zIndex: 1
    },
    portalBtn: {
      width: '100%',
      padding: '1rem 2rem',
      borderRadius: '14px',
      fontWeight: '800',
      fontSize: '1.1rem',
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
      borderRadius: '28px',
      padding: '3rem 2rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      marginBottom: '4rem'
    },
    featuresTitle: {
      fontSize: '2.5rem',
      fontWeight: '900',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '3rem'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2.5rem'
    },
    featureItem: {
      textAlign: 'center',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    featureIcon: {
      width: '90px',
      height: '90px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      fontSize: '3rem',
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
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#1a1a2e',
      marginBottom: '0.75rem'
    },
    featureDescription: {
      color: '#6B7280',
      fontSize: '1rem',
      lineHeight: '1.7'
    },
    benefits: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '28px',
      padding: '3rem 2rem',
      marginBottom: '4rem',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    },
    benefitsTitle: {
      fontSize: '2.5rem',
      fontWeight: '900',
      textAlign: 'center',
      color: 'white',
      marginBottom: '3rem',
      textShadow: '0 2px 12px rgba(0, 0, 0, 0.2)'
    },
    benefitsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      maxWidth: '1000px',
      margin: '0 auto'
    },
    benefitItem: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    },
    benefitIcon: {
      fontSize: '2rem',
      minWidth: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    benefitText: {
      flex: 1
    },
    benefitTextTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1a1a2e',
      marginBottom: '0.5rem'
    },
    benefitTextDesc: {
      fontSize: '0.95rem',
      color: '#6B7280',
      lineHeight: '1.6'
    },
    footer: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    footerTitle: {
      fontSize: '1.75rem',
      fontWeight: '900',
      marginBottom: '0.75rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    footerText: {
      color: '#9CA3AF',
      fontSize: '1rem',
      fontWeight: '500'
    }
  };

  const handleCardHover = (e, isEntering) => {
    const card = e.currentTarget;
    if (isEntering) {
      card.style.transform = 'translateY(-15px) scale(1.02)';
      card.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.25)';
      const glow = card.querySelector('.card-glow');
      const icon = card.querySelector('.portal-icon');
      if (glow) glow.style.opacity = '1';
      if (icon) icon.style.transform = 'scale(1.15) rotate(10deg)';
    } else {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
      const glow = card.querySelector('.card-glow');
      const icon = card.querySelector('.portal-icon');
      if (glow) glow.style.opacity = '0';
      if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
    }
  };

  const handleFeatureHover = (e, isEntering) => {
    const item = e.currentTarget;
    const icon = item.querySelector('.feature-icon');
    if (isEntering) {
      item.style.transform = 'translateY(-12px) scale(1.05)';
      if (icon) {
        icon.style.transform = 'scale(1.15) rotate(-8deg)';
        icon.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
      }
    } else {
      item.style.transform = 'translateY(0) scale(1)';
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
      }
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

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block !important;
          }
          
          .desktop-nav-buttons {
            display: none !important;
          }
          
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.1rem !important;
          }
          
          .portal-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          
          .benefits-list {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1.25rem !important;
          }
          
          .hero-title {
            font-size: 1.75rem !important;
          }
          
          .features-title, .benefits-title {
            font-size: 1.75rem !important;
          }
          
          .portal-card {
            padding: 2rem 1.5rem !important;
          }
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
                const icon = e.currentTarget.querySelector('.logo-icon');
                if (icon) icon.style.transform = 'rotate(360deg) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                const icon = e.currentTarget.querySelector('.logo-icon');
                if (icon) icon.style.transform = 'rotate(0deg) scale(1)';
              }}
            >
              <div className="logo-icon" style={styles.logoIcon}>
                <span style={{ color: 'white', fontSize: '1.5rem' }}>⏰</span>
              </div>
              <h1 className="logo-text" style={styles.logoText}>AttendFlow</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="desktop-nav-buttons" style={styles.navButtons}>
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

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              style={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          <div style={styles.mobileMenu}>
            <button
              style={{...styles.btnOutline, width: '100%'}}
              onClick={() => {
                navigate('/employee-login');
                setMobileMenuOpen(false);
              }}
            >
              Employee Login
            </button>
            <button
              style={{...styles.btnGradient, width: '100%'}}
              onClick={() => {
                navigate('/admin-login');
                setMobileMenuOpen(false);
              }}
            >
              Admin Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <h2 className="hero-title" style={styles.heroTitle}>
              Employee Attendance &<br />
              <span style={styles.heroGradientText}>Payroll System</span>
            </h2>
            <p className="hero-subtitle" style={styles.heroSubtitle}>
              Manage attendance, track hours, and process payroll with stunning efficiency
            </p>
          </div>

          {/* Stats Section */}
          <div className="stats-grid" style={styles.statsGrid}>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <div style={styles.statNumber}>99.9%</div>
              <div style={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>System Uptime</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <div style={styles.statNumber}>1000+</div>
              <div style={styles.statLabel}>Happy Users</div>
            </div>
          </div>

          {/* Portal Cards */}
          <div className="portal-grid" style={styles.portalGrid}>
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
            <h3 className="features-title" style={styles.featuresTitle}>✨ Powerful Features</h3>
            <div className="features-grid" style={styles.featuresGrid}>
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
                  Track clock in/out times with military-grade precision and instant updates
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
                  Calculate wages automatically with zero errors and lightning-fast processing
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
                  Comprehensive analytics and actionable insights for better decision making
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div style={styles.benefits}>
            <h3 className="benefits-title" style={styles.benefitsTitle}>🎯 Why Choose AttendFlow?</h3>
            <div className="benefits-list" style={styles.benefitsList}>
              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>✅</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Easy to Use</div>
                  <div style={styles.benefitTextDesc}>Intuitive interface that anyone can master in minutes</div>
                </div>
              </div>

              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>🔒</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Secure & Reliable</div>
                  <div style={styles.benefitTextDesc}>Bank-level encryption keeps your data safe</div>
                </div>
              </div>

              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>⚡</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Lightning Fast</div>
                  <div style={styles.benefitTextDesc}>Process thousands of records in seconds</div>
                </div>
              </div>

              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>📱</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Mobile Friendly</div>
                  <div style={styles.benefitTextDesc}>Access from any device, anywhere, anytime</div>
                </div>
              </div>

              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>💡</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Smart Insights</div>
                  <div style={styles.benefitTextDesc}>AI-powered analytics for better workforce management</div>
                </div>
              </div>

              <div 
                style={styles.benefitItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.benefitIcon}>🎨</div>
                <div style={styles.benefitText}>
                  <div style={styles.benefitTextTitle}>Beautiful Design</div>
                  <div style={styles.benefitTextDesc}>Modern interface that makes work enjoyable</div>
                </div>
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