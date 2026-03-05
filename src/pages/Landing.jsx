import { useState, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Component as HeroSlider } from "../components/ui/lumina-interactive-list"
import { ShuffleHero } from "../components/ui/shuffle-grid"
import "../cinematic.css"

/* =========================================================
   NAVBAR — Modern frosted glass
   ========================================================= */
function Navbar({ scrolled }) {
    return (
        <motion.nav
            className={`cinematic-nav ${scrolled ? "cinematic-nav--scrolled" : ""}`}
            style={{ position: "fixed", top: 0, left: 0, width: "100%" }}
        >
            <div className="cinematic-nav__inner" style={{ display: "flex", alignItems: "center" }}>

                {/* LEFT */}
                <div style={{ flex: 1 }}>
                    <NavLink to="/" className="cinematic-nav__link">Home</NavLink>
                </div>

                {/* CENTER */}
                <div style={{ flex: 1, textAlign: "center" }}>
                    <Link to="/" className="cinematic-nav__brand-text">
                        FoundersKick
                    </Link>
                </div>

                {/* RIGHT */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "24px" }}>
                    <NavLink to="/network" className="cinematic-nav__link">Network</NavLink>
                    <NavLink to="/startups" className="cinematic-nav__link">Startups</NavLink>
                    <NavLink to="/about" className="cinematic-nav__link">About</NavLink>

                    <Link to="/login" className="nav-cta-btn">
                        <span className="nav-cta-text">Sign in / Sign up</span>
                    </Link>
                </div>

            </div>
        </motion.nav>
    )
}

/* =========================================================
   LANDING PAGE
   ========================================================= */
export default function Landing() {
    const [navScrolled, setNavScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="cinematic-landing">

            {/* Navbar */}
            <Navbar scrolled={navScrolled} />

            {/* ===== HERO (LUMINA SLIDER) ===== */}
            <HeroSlider />

            {/* ===== SHUFFLE GRID HERO — THREE PILLARS ===== */}
            <ShuffleHero />

            {/* ===== FOOTER ===== */}
            <footer className="cinematic-footer">
                <div className="cinematic-footer__inner">
                    <div className="cinematic-footer__grid">
                        <div className="cinematic-footer__brand-col">
                            <div className="cinematic-footer__brand">FoundersKick</div>
                            <p className="cinematic-footer__desc">
                                The platform where founders connect, commit, and collaborate to build the future.
                            </p>
                        </div>

                        <div className="cinematic-footer__links-col">
                            <div className="cinematic-footer__section">
                                <div className="cinematic-footer__section-title">Platform</div>
                                <a className="cinematic-footer__link">Explore Startups</a>
                                <a className="cinematic-footer__link">Find Co-Founders</a>
                                <a className="cinematic-footer__link">Launch Startup</a>
                            </div>

                            <div className="cinematic-footer__section">
                                <div className="cinematic-footer__section-title">Company</div>
                                <a className="cinematic-footer__link">About</a>
                                <a className="cinematic-footer__link">Careers</a>
                                <a className="cinematic-footer__link">Contact</a>
                            </div>
                        </div>
                    </div>

                    <div className="cinematic-footer__bottom">
                        <span>© 2026 FoundersKick. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}