import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import Lenis from "lenis"
import { ArrowRight } from "lucide-react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
    const pageRef = useRef(null)
    const realityRef = useRef(null)
    const whatIsRef = useRef(null)
    const howRef = useRef(null)
    const communityRef = useRef(null)
    const featuresRef = useRef(null)
    const proofRef = useRef(null)
    const ctaRef = useRef(null)
    const canvasRef = useRef(null)
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const imageSeq = useRef({ frame: 0 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);

        checkMobile();

        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);


    // Setup smooth scrolling with Lenis
    useEffect(() => {
        if (isMobile) return;

        const lenis = new Lenis({
            duration: 1.2,
            smooth: true,
        });

        gsap.ticker.lagSmoothing(0);

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.fps(60);

        return () => {
            lenis.destroy();
            ScrollTrigger.killAll();
        };
    }, [isMobile]);

    useEffect(() => {
        const frameCount = isMobile ? 60 : 159;
        const step = isMobile ? 2 : 1;

        const currentFrame = (index) =>
            `/frames/frame_${String(index).padStart(4, "0")}.jpg`;

        const images = new Array(frameCount);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");

        // 🔥 RENDER FUNCTION (safe)
        const render = () => {
            const img = images[imageSeq.current.frame];
            if (!img || !img.complete) return;

            const scale = Math.max(
                canvas.width / img.width,
                canvas.height / img.height
            );

            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
                img,
                x,
                y,
                img.width * scale,
                img.height * scale
            );
        };

        // 🔥 RESIZE
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // 🔥 LOAD FIRST FEW FRAMES IMMEDIATELY
        const preloadCount = isMobile ? 5 : 10;

        for (let i = 0; i < preloadCount; i++) {
            const img = new Image();
            img.src = currentFrame((i * step) + 1);
            img.decoding = "async";

            images[i] = img;

            if (i === 0) {
                img.onload = render;
            }
        }

        // 🔥 LAZY LOAD REMAINING FRAMES
        let loadedIndex = preloadCount;

        const loadNextBatch = () => {
            const batchSize = 5;

            for (let i = 0; i < batchSize && loadedIndex < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame((loadedIndex * step) + 1);
                img.decoding = "async";

                images[loadedIndex] = img;
                loadedIndex++;
            }

            if (loadedIndex < frameCount) {
                idle(loadNextBatch); // 👈 uses fallback
            }
        };

        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
        idle(loadNextBatch);

        // 🔥 GSAP
        const trigger = ScrollTrigger.create({
            trigger: ".hero-section",
            start: "top top",
            end: isMobile ? "+=1200" : `+=${frameCount * 28}`,
            scrub: 0.4,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                imageSeq.current.frame = Math.floor(self.progress * (frameCount - 1));
                render();

                const progress = self.progress;
                const text = document.querySelectorAll(".hero-line");

                const fadeStart = 0.5;
                const fadeEnd = 0.75;

                text.forEach(el => {
                    let opacity = 1;

                    if (progress >= fadeStart && progress <= fadeEnd) {
                        opacity = 1 - (progress - fadeStart) / (fadeEnd - fadeStart);
                    } else if (progress > fadeEnd) {
                        opacity = 0;
                    }

                    el.style.opacity = opacity;
                    el.style.transform = `translateY(${(1 - opacity) * -120}px)`;
                });
            }
        });

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            trigger.kill();
        };

    }, [isMobile]);

    useEffect(() => {

        const tlIntro = gsap.timeline()

        tlIntro.fromTo(".overlay-entrance", { scaleY: 1 }, { scaleY: 0, duration: 1.5, ease: "power4.inOut" })
        tlIntro.fromTo(".nav-entrance", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.5")
        tlIntro.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power4.out" }, "-=1")
        tlIntro.fromTo(".hero-image", { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 0.6, duration: 2, ease: "power2.out" }, "-=1.5")
        tlIntro.fromTo(".hero-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1")

        const sections = [realityRef, whatIsRef, howRef, communityRef, featuresRef, proofRef]

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

    return (
        <div className="text-[#e2dfce] font-sans selection:bg-[#9b1b30] selection:text-white relative z-0 min-h-screen" ref={pageRef}>

            {/* Cinematic Overlay Entrance */}
            <div className="overlay-entrance fixed inset-0 bg-[#020202] z-[100] transform origin-top pointer-events-none"></div>

            {/* Film Grain */}
            <div className="film-grain"></div>

            {/* Navbar */}
            <nav className="nav-entrance fixed top-0 w-full z-[50] px-6 md:px-8 py-5 flex justify-between items-center bg-black/30 backdrop-blur-md">

                <Link to="/" className="font-serif text-xl md:text-2xl tracking-widest font-bold text-white uppercase italic">
                    FoundersKick
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex gap-8 items-center text-sm tracking-widest">
                    <Link to="/" className="text-white">Home</Link>
                    <Link to="/network" className="text-white">Network</Link>
                    <Link to="/startups" className="text-white">Launch</Link>
                    <Link to="/login" className="btn-brutal text-xs ml-4">
                        <span>Sign In</span>
                    </Link>
                </div>

                {/* Mobile button */}
                <button
                    className="md:hidden text-white text-2xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="absolute top-full left-0 w-full bg-black/95 flex flex-col items-center py-6 gap-6 text-white">
                        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link to="/network" onClick={() => setMenuOpen(false)}>Network</Link>
                        <Link to="/startups" onClick={() => setMenuOpen(false)}>Launch</Link>
                        <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <section className="relative hero-section">

                <div className="h-[100dvh] w-full overflow-hidden hero-sticky">

                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                    />

                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* TEXT */}
                    <div className="relative z-10 h-full flex items-center px-6 sm:px-10">
                        <div>
                            <p className="hero-subtitle text-sm tracking-widest mb-4 text-[#a3a195]">
                                Chapter I. The Anomaly
                            </p>

                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight text-white">
                                <span className="hero-line">FORGING</span><br />
                                <span className="hero-line text-[#9b1b30] italic">THE FUTURE</span><br />
                                <span className="hero-line">LEGACY</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            <div>
                {/* 1. PROBLEM / REALITY SECTION */}
                <section ref={realityRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent cinematic-layer border-y border-white/5">
                    <div className="absolute inset-0 bg-[#020202]"></div>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-32 relative z-10">
                        <div className="md:w-1/2 w-full space-y-8">
                            <h2 className="cinematic-text font-sans text-5xl md:text-7xl font-bold uppercase leading-none tracking-tight">
                                <span className="text-[#a3a195] block mb-2 text-3xl md:text-5xl font-normal">STUCK IN</span>
                                THE LOOP.
                            </h2>
                            <div className="w-16 h-px bg-[#9b1b30] my-8 cinematic-text"></div>
                            <p className="cinematic-text text-xl font-light text-[#e2dfce] font-sans tracking-wide leading-relaxed">
                                Endlessly consuming content. Theorizing without execution. The ecosystem is soft, bloated, and afraid of real work.
                            </p>
                            <p className="cinematic-text text-xl font-bold text-[#e2dfce] font-sans tracking-wide leading-relaxed">
                                You lack accountability. We fix that.
                            </p>
                        </div>
                        <div className="md:w-1/2 w-full relative h-[600px] overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(155,27,48,0.2)_0%,transparent_70%)] blur-3xl rounded-full"></div>
                            <img
                                src="/hero/Features.png"
                                alt="Reality"
                                className="cinematic-img w-full h-[120%] object-cover absolute top-[-10%] mix-blend-difference grayscale group-hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-[#020202]/30 mix-blend-multiply"></div>
                            <div className="absolute bottom-0 left-0 p-6 bg-[#020202]/90 border border-white/5">
                                <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#9b1b30]">Sys.Diag // The Default Path</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. WHAT FOUNDERSKICK IS */}
                <section ref={whatIsRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-[#020202] overflow-hidden">
                    <div className="max-w-7xl mx-auto text-center space-y-12">
                        <p className="cinematic-text text-[#9b1b30] text-sm uppercase font-mono tracking-[0.3em]">The Alternative</p>
                        <h2 className="cinematic-text font-sans text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter">
                            A BUILDER-FIRST <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">ECOSYSTEM.</span>
                        </h2>
                        <div className="cinematic-text max-w-3xl mx-auto flex flex-col md:flex-row gap-8 mt-16 text-left">
                            <div className="flex-1 p-8 border border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Network.</h3>
                                <p className="text-[#a3a195]">Surround yourself with people who ship code, not just tweet about it.</p>
                            </div>
                            <div className="flex-1 p-8 border border-white/5 bg-white/[0.02]">
                                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Execution.</h3>
                                <p className="text-[#a3a195]">Ideas are useless. Execution is the only metric that matters here.</p>
                            </div>
                            <div className="flex-1 p-8 border border-[#9b1b30]/20 bg-[#9b1b30]/5">
                                <h3 className="text-xl font-bold text-[#9b1b30] mb-4 uppercase tracking-widest">Accountability.</h3>
                                <p className="text-[#a3a195]">Brutal honesty and feedback loops. Survive the crucible.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. HOW IT WORKS */}
                <section ref={howRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent cinematic-layer">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block"></div>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="cinematic-text font-sans text-4xl md:text-5xl font-bold uppercase mb-24 md:text-center tracking-tight">The Protocol</h2>

                        <div className="space-y-24">
                            <div className="cinematic-text flex flex-col md:flex-row items-center gap-12 group">
                                <div className="md:w-1/2 text-left md:text-right">
                                    <h3 className="text-4xl font-bold text-white mb-4">JOIN.</h3>
                                    <p className="text-[#a3a195] text-lg">Enter the syndicate. Verify your identity as a creator, founder, or engineer.</p>
                                </div>
                                <div className="flex-none w-16 h-16 rounded-full bg-[#0a0a0a] border border-[#9b1b30] flex items-center justify-center relative z-10 group-hover:bg-[#9b1b30] transition-colors duration-500">
                                    <span className="font-mono text-white text-sm">01</span>
                                </div>
                                <div className="md:w-1/2"></div>
                            </div>

                            <div className="cinematic-text flex flex-col md:flex-row-reverse items-center gap-12 group">
                                <div className="md:w-1/2 text-left">
                                    <h3 className="text-4xl font-bold text-white mb-4">CONNECT.</h3>
                                    <p className="text-[#a3a195] text-lg">Find your squad. Align with outliers who match your intensity.</p>
                                </div>
                                <div className="flex-none w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center relative z-10 group-hover:border-white transition-colors duration-500">
                                    <span className="font-mono text-white text-sm">02</span>
                                </div>
                                <div className="md:w-1/2"></div>
                            </div>

                            <div className="cinematic-text flex flex-col md:flex-row items-center gap-12 group">
                                <div className="md:w-1/2 text-left md:text-right">
                                    <h3 className="text-4xl font-bold text-white mb-4">BUILD.</h3>
                                    <p className="text-[#a3a195] text-lg">Ship features, not decks. We prioritize product over presentation.</p>
                                </div>
                                <div className="flex-none w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center relative z-10 group-hover:border-white transition-colors duration-500">
                                    <span className="font-mono text-white text-sm">03</span>
                                </div>
                                <div className="md:w-1/2"></div>
                            </div>

                            <div className="cinematic-text flex flex-col md:flex-row-reverse items-center gap-12 group">
                                <div className="md:w-1/2 text-left">
                                    <h3 className="text-4xl font-bold text-white mb-4 text-[#9b1b30]">LAUNCH.</h3>
                                    <p className="text-[#a3a195] text-lg">Unleash it. Get users. Adapt or die.</p>
                                </div>
                                <div className="flex-none w-16 h-16 rounded-full bg-[#9b1b30]/10 border border-[#9b1b30] flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(155,27,48,0.5)]">
                                    <span className="font-mono text-[#9b1b30] font-bold text-sm">04</span>
                                </div>
                                <div className="md:w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. COMMUNITY / NETWORK */}
                <section ref={communityRef} className="relative py-32 md:py-48 px-8 bg-[#0a0a0a] overflow-hidden border-y border-white/5">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-5/12 space-y-8 z-10">
                            <h2 className="cinematic-text text-5xl md:text-7xl font-sans font-black uppercase leading-none tracking-tighter">
                                NOT FOR <br /><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">TOURISTS.</span>
                            </h2>
                            <p className="cinematic-text text-lg text-[#a3a195]">
                                The room you sit in determines your trajectory. We curate founders, hardcore developers, rogue designers, and operators who bleed their craft.
                            </p>
                            <div className="cinematic-text grid grid-cols-2 gap-4 pt-8">
                                <div className="border-l-2 border-[#9b1b30] pl-4">
                                    <span className="block text-3xl font-bold text-white">400+</span>
                                    <span className="text-xs uppercase tracking-widest text-[#a3a195]">Active Builders</span>
                                </div>
                                <div className="border-l-2 border-[#333] pl-4">
                                    <span className="block text-3xl font-bold text-white">24/7</span>
                                    <span className="text-xs uppercase tracking-widest text-[#a3a195]">Global Relay</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-7/12 w-full relative h-[500px]">
                            <img
                                src="/hero/Network.png"
                                alt="Network"
                                className="cinematic-img w-full h-[120%] absolute top-[-10%] object-cover opacity-60 mix-blend-lighten grayscale contrast-125"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
                        </div>
                    </div>
                </section>

                {/* 5. FEATURES / VALUE GRID */}
                <section ref={featuresRef} className="relative py-32 md:py-48 px-8 md:px-20 bg-transparent">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="cinematic-text font-sans text-4xl md:text-5xl font-bold uppercase mb-16 tracking-tight">The Arsenal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <div className="cinematic-text p-8 bg-[#040404] border border-white/5 hover:border-[#9b1b30]/50 transition-colors group">
                                <div className="w-10 h-10 mb-8 border border-white/10 flex items-center justify-center group-hover:bg-[#9b1b30]/10 transition-colors">
                                    <div className="w-3 h-3 bg-white group-hover:bg-[#9b1b30]"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Co-Build Sessions</h3>
                                <p className="text-sm text-[#a3a195] leading-relaxed">Pair up with complementary skills. Stop building in a silo. Real-time collaboration.</p>
                            </div>

                            <div className="cinematic-text p-8 bg-[#040404] border border-white/5 hover:border-[#9b1b30]/50 transition-colors group">
                                <div className="w-10 h-10 mb-8 border border-white/10 flex items-center justify-center group-hover:bg-[#9b1b30]/10 transition-colors">
                                    <div className="w-3 h-3 bg-white group-hover:bg-[#9b1b30]"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Brutal Feedback</h3>
                                <p className="text-sm text-[#a3a195] leading-relaxed">No ego padding. Get tear-downs on your UI, pitch, and architecture from veterans.</p>
                            </div>

                            <div className="cinematic-text p-8 bg-[#040404] border border-white/5 hover:border-[#9b1b30]/50 transition-colors group">
                                <div className="w-10 h-10 mb-8 border border-white/10 flex items-center justify-center group-hover:bg-[#9b1b30]/10 transition-colors">
                                    <div className="w-3 h-3 bg-white group-hover:bg-[#9b1b30]"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">Project Board</h3>
                                <p className="text-sm text-[#a3a195] leading-relaxed">Discover alpha stages. Join as an early contibutor or recruit for your own mission.</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 6. SOCIAL PROOF */}
                <section ref={proofRef} className="relative py-24 md:py-32 px-8 bg-[#0a0a0a] border-y border-white/5">
                    <div className="max-w-4xl mx-auto text-center cinematic-text">
                        <p className="text-2xl md:text-4xl font-light italic text-[#e2dfce] leading-relaxed">
                            "I stopped reading startup advice and just shipped. FoundersKick was the catalyst."
                        </p>
                        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-[#9b1b30]">Class 01 Alumni</p>
                    </div>
                </section>

                {/* 7. FINAL CTA SECTION */}
                <section ref={ctaRef} className="relative py-48 px-8 flex items-center justify-center bg-[#020202] overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,27,48,0.15)_0%,transparent_60%)]"></div>
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <h2 className="cta-text font-sans text-5xl md:text-9xl font-black uppercase tracking-tighter mb-8 text-white">
                            STOP <span className="text-transparent bg-clip-text bg-gradient-to-b from-gray-500 to-gray-800">CONSUMING.</span>
                            <br /> START <span className="text-[#9b1b30]">BUILDING.</span>
                        </h2>
                        <p className="cta-text text-[#a3a195] text-lg max-w-xl mx-auto tracking-wide mb-12">
                            The platform is live. The only missing variable is your execution.
                        </p>
                        <div className="cta-text flex flex-col sm:flex-row gap-6">
                            <Link to="/signup" className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-transparent hover:text-white border border-white">
                                <span className="relative z-10 flex items-center gap-2">Initiate Launch <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                                <div className="absolute inset-0 bg-[#9b1b30] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}