import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import Image from 'next/image';

export async function NavBar() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link href="/" className="navbar-brand">
                    🎸 Tour Guide
                </Link>

                {user && (
                    <div className="navbar-nav">
                        <Link href="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        <Link href="/dashboard/tours" className="nav-link">
                            Tours
                        </Link>
                        <Link href="/dashboard/inventory" className="nav-link">
                            Inventory
                        </Link>
                        <Link href="/dashboard/reports" className="nav-link">
                            Reports
                        </Link>
                    </div>
                )}
            </div>

            <div className="navbar-right">
                {user ? (
                    <div className="navbar-user">
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        {user.picture && (
                            <Image
                                src={user.picture}
                                alt={user.name || 'User'}
                                width={32}
                                height={32}
                                className="user-avatar"
                            />
                        )}
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                        <a href="/api/auth/logout" className="logout-btn">
                            Logout
                        </a>
                    </div>
                ) : (
                    // eslint-disable-next-line @next/next/no-html-link-for-pages
                    <a href="/api/auth/login" className="btn btn-primary">
                        Log In
                    </a>
                )}
            </div>
        </nav>
    );
}
