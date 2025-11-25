import Link from 'next/link';

export default function PricingPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '50%',
                    filter: 'blur(120px)',
                    animation: 'pulse 4s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'rgba(236, 72, 153, 0.2)',
                    borderRadius: '50%',
                    filter: 'blur(120px)',
                    animation: 'pulse 4s ease-in-out infinite',
                    animationDelay: '1s'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '20%',
                    width: '20%',
                    height: '20%',
                    background: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(100px)'
                }} />
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pricing-card {
                    transition: all 0.3s ease;
                }
                .pricing-card:hover {
                    transform: translateY(-8px);
                }
                @media (max-width: 768px) {
                    .pricing-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {/* Header with Logo */}
            <header style={{
                position: 'relative',
                zIndex: 20,
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Link href="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #ffffff, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textDecoration: 'none',
                        transition: 'opacity 0.3s'
                    }}>
                        Tour Guide
                    </Link>
                </div>
            </header>

            <main style={{
                flex: 1,
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '3rem 1.5rem',
                position: 'relative',
                zIndex: 10,
                width: '100%'
            }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    animation: 'fadeIn 0.6s ease-out'
                }}>
                    <div style={{
                        display: 'inline-block',
                        marginBottom: '1rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'rgba(192, 132, 252, 1)',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        letterSpacing: '0.1em',
                        backdropFilter: 'blur(8px)'
                    }}>
                        PRICING PLANS
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                        fontWeight: 'bold',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #ffffff, #d8b4fe, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.025em'
                    }}>
                        Choose Your Stage
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        color: '#d1d5db',
                        maxWidth: '42rem',
                        margin: '0 auto',
                        lineHeight: '1.75'
                    }}>
                        Whether you're playing local clubs or selling out stadiums, we have the perfect toolkit for your merchandise operations.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="pricing-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    alignItems: 'start'
                }}>
                    {/* Opener Tier */}
                    <div className="pricing-card" style={{
                        position: 'relative',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.05), transparent)',
                            opacity: 0,
                            transition: 'opacity 0.5s',
                            borderRadius: '1.5rem',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Opener</h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2rem', minHeight: '2.5rem' }}>
                                Perfect for local bands just starting their journey.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>Free</span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, fontSize: '0.875rem' }}>
                                {[
                                    '1 Active Tour',
                                    'Basic Inventory Tracking',
                                    '1 User Account',
                                    'Standard Sales Reports',
                                    'Mobile App Access'
                                ].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', color: '#d1d5db', marginBottom: '1rem' }}>
                                        <div style={{
                                            marginRight: '0.75rem',
                                            padding: '0.25rem',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: '#a78bfa',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/api/auth/login"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Start Free
                            </Link>
                        </div>
                    </div>

                    {/* Headliner Tier - Featured */}
                    <div className="pricing-card" style={{
                        position: 'relative',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        background: 'linear-gradient(to bottom, rgba(88, 28, 135, 0.2), rgba(0, 0, 0, 0.4))',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 1), transparent)',
                            opacity: 0.5
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '0.25rem 0.75rem',
                            background: '#7c3aed',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '9999px',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                            letterSpacing: '0.1em'
                        }}>
                            MOST POPULAR
                        </div>

                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Headliner</h3>
                            <p style={{ color: 'rgba(233, 213, 255, 0.8)', fontSize: '0.875rem', marginBottom: '2rem', minHeight: '2.5rem' }}>
                                For touring bands with dedicated merch teams.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>$29</span>
                                <span style={{ color: '#9ca3af', marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    / month
                                </span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, fontSize: '0.875rem' }}>
                                {[
                                    'Unlimited Tours',
                                    'Advanced Inventory & Variants',
                                    'Up to 5 Team Members',
                                    'Seller Management & Roles',
                                    'Real-time Analytics',
                                    'Offline Mode (Coming Soon)',
                                    'Priority Support'
                                ].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', color: '#ffffff', marginBottom: '1rem' }}>
                                        <div style={{
                                            marginRight: '0.75rem',
                                            padding: '0.25rem',
                                            borderRadius: '50%',
                                            background: '#8b5cf6',
                                            color: '#ffffff',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                            flexShrink: 0
                                        }}>
                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/api/auth/login"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '0.75rem',
                                    background: 'linear-gradient(to right, #9333ea, #ec4899)',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.25)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* World Tour Tier */}
                    <div className="pricing-card" style={{
                        position: 'relative',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.05), transparent)',
                            opacity: 0,
                            transition: 'opacity 0.5s',
                            borderRadius: '1.5rem',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>World Tour</h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2rem', minHeight: '2.5rem' }}>
                                Enterprise power for major acts and labels.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>$99</span>
                                <span style={{ color: '#9ca3af', marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                    / month
                                </span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, fontSize: '0.875rem' }}>
                                {[
                                    'Everything in Headliner',
                                    'Unlimited Team Members',
                                    'Multi-Tour Analytics Dashboard',
                                    'Custom Integrations',
                                    'Dedicated Account Manager',
                                    'SLA & 24/7 Support',
                                    'Venue Settlement Tools'
                                ].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', color: '#d1d5db', marginBottom: '1rem' }}>
                                        <div style={{
                                            marginRight: '0.75rem',
                                            padding: '0.25rem',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: '#f472b6',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="mailto:sales@tourguide.app"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{
                    marginTop: '5rem',
                    textAlign: 'center',
                    maxWidth: '48rem',
                    margin: '5rem auto 0'
                }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        textAlign: 'left'
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <h4 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Can I switch plans later?
                            </h4>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <h4 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Do you take a cut of merch sales?
                            </h4>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                Never. We charge a flat monthly fee. Your merchandise revenue is 100% yours.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#9ca3af',
                        textDecoration: 'none',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'color 0.3s'
                    }}>
                        <span>←</span> Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
