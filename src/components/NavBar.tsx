import { auth0 } from '@/lib/auth0';
import ResponsiveNavBar from './ResponsiveNavBar';

export async function NavBar() {
    const session = await auth0.getSession();
    const user = session?.user;

    return <ResponsiveNavBar user={user} />;
}
