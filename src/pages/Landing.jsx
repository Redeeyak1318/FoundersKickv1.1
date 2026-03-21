import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import Lenis from "lenis"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import ScrollHero from "../components/ScrollHero"

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
    const pageRef = useRef(null)
    const aboutRef = useRef(null)
    const featuresRef = useRef(null)
    const networkRef = useRef(null)
    const launchRef = useRef(null)
    const ctaRef = useRef(null)
    const [heroDone, setHeroDone] = useState(false)

    // Setup smooth scrolling with Lenis
    useEffect(() => {
        if (!heroDone) return;

        const lenis = new Lenis({
            duration: 1.2,
            smooth: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        return () => {
            lenis.destroy();
            ScrollTrigger.killAll();
        };
    }, [heroDone]);


    // Intro animation simulating Barba.js entrance
    useEffect(() => {

        const tlIntro = gsap.timeline()

        tlIntro.fromTo(".overlay-entrance", { scaleY: 1 }, { scaleY: 0, duration: 1.5, ease: "power4.inOut" })
        tlIntro.fromTo(".nav-entrance", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.5")
        tlIntro.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power4.out" }, "-=1")
        tlIntro.fromTo(".hero-image", { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 0.6, duration: 2, ease: "power2.out" }, "-=1.5")
        tlIntro.fromTo(".hero-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1")

        const sections = [aboutRef, featuresRef, networkRef, launchRef]

        sections.forEach((sec) => {
            if (sec.current) {
                const img = sec.current.querySelector('.cinematic-img')
                const textElements = sec.current.querySelectorAll('.cinematic-text')

                if (img) {
                    gsap.fromTo(img,
                        { yPercent: -10, scale: 1.1 },
                        {
                            yPercent: 10,
                            scale: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: sec.current,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: true
                            }
                        }
                    )
                }

                if (textElements.length > 0) {
                    gsap.fromTo(textElements,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            stagger: 0.1,
                            duration: 1.2,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: sec.current,
                                start: "top 80%",
                            }
                        }
                    )
                }
            }
        })

        if (ctaRef.current) {
            gsap.fromTo(ctaRef.current.querySelectorAll('.cta-text'),
                { y: 40, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    stagger: 0.2,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 75%"
                    }
                }
            )
        }

    }, [])
    // Canvas Animation specific useEffect removed

    return (
        <div className="text-[#e2dfce] font-sans selection:bg-[#9b1b30] selection:text-white relative z-0 min-h-screen" ref={pageRef}>

            {/* Cinematic Overlay Entrance */}
            <div className="overlay-entrance fixed inset-0 bg-[#020202] z-[100] transform origin-top pointer-events-none"></div>

            {/* Film Grain */}
            <div className="film-grain"></div>

            {/* Navbar */}
            <nav className="nav-entrance fixed top-0 w-full z-[10000] px-8 py-6 flex justify-between items-center">
                <Link to="/" className="font-serif text-2xl tracking-widest font-bold text-white uppercase italic">
                    FoundersKick
                </Link>
                <div className="flex gap-8 items-center text-sm font-sans tracking-widest">
                    <Link to="/" className="nav-link text-white">Home</Link>
                    <Link to="/network" className="nav-link text-white">Network</Link>
                    <Link to="/startups" className="nav-link text-white">Launch Startups</Link>
                    <Link to="/login" className="btn-brutal text-xs ml-4"><span>Sign In / Sign Up</span></Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <ScrollHero
                startFrame={1}
                endFrame={1122}
                onComplete={() => setHeroDone(true)}
            />

            <div className={heroDone ? "block" : "hidden"}>
                {/* ABOUT / VALUE SECTION */}
                <section ref={aboutRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent cinematic-layer border-y border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32">
                        <div className="md:w-1/2 w-full space-y-8">
                            <h2 className="cinematic-text font-serif text-5xl md:text-7xl uppercase leading-none">
                                A Genesis <br /><span className="italic text-[#a3a195]">Of Visionaries</span>
                            </h2>
                            <div className="w-16 h-px bg-[#4a0c16] my-8 cinematic-text"></div>
                            <p className="cinematic-text text-xl font-light text-[#a3a195] font-sans tracking-wide leading-relaxed">
                                We discard the rigid matrices of traditional accelerators. FoundersKick is a brutal crucible for ideas—where raw passion converges with untempered ambition. We connect the outliers.
                            </p>
                            <p className="cinematic-text text-sm uppercase tracking-[0.2em] text-[#9b1b30] pt-4">Rule 01: Defy Convention</p>
                        </div>
                        <div className="md:w-1/2 w-full relative h-[600px] overflow-hidden group">
                            <img
                                src="/hero/Features.png"
                                alt="Ecosystem"
                                className="cinematic-img w-full h-[120%] object-cover absolute top-[-10%] mix-blend-exclusion grayscale group-hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-[#020202]/10 mix-blend-overlay"></div>
                            <div className="absolute bottom-0 left-0 p-6 bg-[#020202]/80 backdrop-blur-sm border-t border-r border-white/10">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#e2dfce]">Fig 1. The Ecosystem</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section ref={featuresRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent overflow-hidden">
                    <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(74,12,22,0.15)_0%,transparent_70%)] blur-3xl rounded-full"></div>
                    <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16 md:gap-32">
                        <div className="md:w-1/2 w-full relative h-[700px] overflow-hidden">
                            <img
                                src="/hero/Network.png"
                                alt="Dashboard Features"
                                className="cinematic-img w-full h-[120%] object-cover absolute top-[-10%] brightness-75 contrast-125 saturate-50"
                            />
                            <div className="absolute top-8 left-8 p-4 border border-[#9b1b30]/30 bg-[#020202]/50 backdrop-blur-md">
                                <p className="text-[10px] uppercase font-mono tracking-widest text-[#9b1b30]">Sys.Override // Active</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 w-full space-y-12 shrink-0">
                            <h2 className="cinematic-text font-serif text-5xl md:text-6xl uppercase leading-none">
                                Unfiltered <span className="block text-[#9b1b30] italic mt-2">Intelligence</span>
                            </h2>
                            <ul className="space-y-8 border-l-2 border-[#121212] pl-8">
                                <li className="cinematic-text relative">
                                    <span className="absolute -left-[35px] top-6 w-2 h-2 rounded-full bg-[#9b1b30]"></span>
                                    <h3 className="text-2xl font-serif uppercase mb-2">Architectural Blueprint</h3>
                                    <p className="text-[#a3a195] text-sm tracking-wide">A dashboard devoid of noise. Absolute control over your trajectory.</p>
                                </li>
                                <li className="cinematic-text relative">
                                    <span className="absolute -left-[35px] top-6 w-2 h-2 rounded-full bg-[#121212]"></span>
                                    <h3 className="text-2xl font-serif uppercase mb-2">Metrics That Bleed</h3>
                                    <p className="text-[#a3a195] text-sm tracking-wide">Engage with data that dictates survival and dominance.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* NETWORK PREVIEW SECTION */}
                <section ref={networkRef} className="relative h-screen flex items-center justify-center overflow-hidden cinematic-layer border-t border-white/5">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/hero/About.png"
                            alt="Network Connections"
                            className="cinematic-img w-full h-[120%] absolute top-[-10%] object-cover opacity-30 mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-[#020202]/80"></div>
                    </div>
                    <div className="relative z-10 text-center max-w-4xl px-8">
                        <p className="cinematic-text text-[#9b1b30] text-sm tracking-[0.3em] uppercase mb-8">The Syndicate</p>
                        <h2 className="cinematic-text font-serif text-6xl md:text-8xl flex flex-col uppercase leading-[0.9]">
                            <span>A Network</span>
                            <span className="italic text-[#e2dfce]/50">Of Consequences</span>
                        </h2>
                        <p className="cinematic-text mt-8 text-lg md:text-xl font-light text-[#a3a195] max-w-2xl mx-auto tracking-wide">
                            You do not merely exist within FoundersKick. You are woven into a visceral tapestry of founders, investors, and rogue visionaries.
                        </p>
                        <div className="cinematic-text mt-12 flex justify-center">
                            <Link to="/network" className="btn-brutal">
                                <span>Explore the Network</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* LAUNCH STARTUPS SECTION */}
                <section ref={launchRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                            <div>
                                <p className="cinematic-text text-sm text-[#9b1b30] uppercase tracking-[0.2em] mb-4">Protocol: Initiation</p>
                                <h2 className="cinematic-text font-serif text-5xl md:text-7xl uppercase">Catalyst <br /><span className="italic text-[#a3a195]">Phase</span></h2>
                            </div>
                            <p className="cinematic-text max-w-md text-[#a3a195] text-right text-base tracking-wide">
                                Submit your vision to the ether. The Launch protocol accelerates your evolution from concept to dominion.
                            </p>
                        </div>
                        <div className="relative w-full h-[70vh] overflow-hidden group">
                            <img
                                src="/hero/Launch.png"
                                alt="Launch Growth"
                                className="cinematic-img w-full h-[120%] absolute top-[-10%] object-cover grayscale brightness-90 contrast-125 saturate-0 group-hover:saturate-50 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80"></div>
                            <div className="absolute bottom-12 left-12">
                                <Link to="/startups" className="cinematic-text font-sans uppercase text-3xl md:text-5xl font-bold tracking-widest text-[#e2dfce] hover:text-[#9b1b30] transition-colors flex items-center gap-6">
                                    Commence Launch <ArrowRight size={40} className="text-[#9b1b30]" />
                                </Link>
                            </div>
                            <div className="torn-edge-top"></div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA SECTION */}
                <section ref={ctaRef} className="relative py-48 px-8 flex items-center justify-center bg-transparent overflow-hidden border-t border-[#121212]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,27,48,0.08)_0%,transparent_60%)]"></div>
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <h2 className="cta-text font-serif text-5xl md:text-8xl uppercase tracking-tighter mb-12 flex flex-col items-center">
                            <span className="block italic text-[#e2dfce]/30 text-3xl md:text-5xl tracking-widest mb-4">The Final</span>
                            <span>Verdict</span>
                        </h2>
                        <p className="cta-text text-[#a3a195] text-lg max-w-xl mx-auto font-light tracking-wide mb-12">
                            There is no turning back. Forge your legacy or fade into obscurity. The realm awaits your command.
                        </p>
                        <div className="cta-text flex flex-col sm:flex-row gap-6">
                            <Link to="/signup" className="btn-brutal bg-[#e2dfce] !text-[#020202] hover:bg-transparent font-bold tracking-widest">
                                <span>Join the Vanguard</span>
                            </Link>
                            <Link to="/login" className="btn-brutal">
                                <span>Access Archives</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}