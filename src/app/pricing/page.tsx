import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Tour Guide Pricing
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Choose the perfect plan for your band's journey. From local gigs to world tours, we've got you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Opener Tier */}
                    <div className="card p-8 flex flex-col border border-gray-800 hover:border-purple-500 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 group-hover:bg-purple-500 transition-colors"></div>
                        <h3 className="text-2xl font-bold mb-2 text-white">Opener</h3>
                        <p className="text-gray-400 mb-6">For local bands just starting out.</p>
                        <div className="text-4xl font-bold mb-6 text-white">
                            Free
                            <span className="text-base font-normal text-gray-500 ml-2">/ forever</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-green-400">✓</span> 1 Active Tour
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-green-400">✓</span> Basic Inventory Tracking
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-green-400">✓</span> 1 User Account
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-green-400">✓</span> Sales Reports
                            </li>
                        </ul>
                        <Link
                            href="/api/auth/login"
                            className="btn btn-secondary w-full text-center py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Start Free
                        </Link>
                    </div>

                    {/* Headliner Tier */}
                    <div className="card p-8 flex flex-col border-2 border-purple-600 relative transform md:-translate-y-4 shadow-2xl shadow-purple-900/20 bg-gray-900/50">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            POPULAR
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white">Headliner</h3>
                        <p className="text-gray-400 mb-6">For touring bands with merch teams.</p>
                        <div className="text-4xl font-bold mb-6 text-white">
                            $29
                            <span className="text-base font-normal text-gray-500 ml-2">/ month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-purple-400">✓</span> Unlimited Tours
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-purple-400">✓</span> Advanced Inventory & Variants
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-purple-400">✓</span> Up to 5 Team Members
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-purple-400">✓</span> Seller Management
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-purple-400">✓</span> Offline Mode (Coming Soon)
                            </li>
                        </ul>
                        <Link
                            href="/api/auth/login"
                            className="btn btn-primary w-full text-center py-3 rounded-lg shadow-lg shadow-purple-600/30"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* World Tour Tier */}
                    <div className="card p-8 flex flex-col border border-gray-800 hover:border-pink-500 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 group-hover:bg-pink-500 transition-colors"></div>
                        <h3 className="text-2xl font-bold mb-2 text-white">World Tour</h3>
                        <p className="text-gray-400 mb-6">For major acts and labels.</p>
                        <div className="text-4xl font-bold mb-6 text-white">
                            $99
                            <span className="text-base font-normal text-gray-500 ml-2">/ month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-pink-400">✓</span> Everything in Headliner
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-pink-400">✓</span> Unlimited Team Members
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-pink-400">✓</span> Multi-Tour Analytics
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-pink-400">✓</span> Dedicated Support
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="mr-2 text-pink-400">✓</span> Custom Integrations
                            </li>
                        </ul>
                        <Link
                            href="mailto:sales@tourguide.app"
                            className="btn btn-secondary w-full text-center py-3 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-16">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
