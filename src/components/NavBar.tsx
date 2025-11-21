import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import UserInfo from './UserInfo';

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
                <UserInfo />
            </div>
        </nav>
    );
}
