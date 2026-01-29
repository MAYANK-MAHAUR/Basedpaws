import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center pt-16 pb-16 sm:pt-20 sm:pb-20 px-4 overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-balance bg-clip-text text-transparent bg-gradient-to-r from-[#0052FF] via-[#3B82F6] to-[#60A5FA] leading-tight">
                        Share & Tip the Funniest Pets on Base
                    </h1>
                    <p className="text-base sm:text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto px-2">
                        Upload photos, vote for favorites, and earn ETH tips from the community
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <a href="#feed">
                        <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 gap-2 h-12 px-8 text-lg">
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </a>
                    <a href="#leaderboard">
                        <Button size="lg" variant="outline" className="rounded-full bg-transparent h-12 px-8 text-lg">
                            View Leaderboard
                        </Button>
                    </a>
                </div>

                {/* Floating Icons Visual */}
                <div className="pt-12 relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent w-full" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto relative z-10">
                        {["🐶", "🐱", "🐹", "🐰"].map((emoji, i) => (
                            <div key={i} className="flex justify-center">
                                <div className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                                    {emoji}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
