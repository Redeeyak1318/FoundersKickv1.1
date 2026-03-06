import { useState, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Component as HeroSlider } from "../components/ui/lumina-interactive-list"
import { ShuffleHero } from "../components/ui/shuffle-grid"
import FoundersKickBackground from "../components/backgrounds/FoundersKickBackground"
import { Footer } from "../components/ui/footer-section"
import "../cinematic.css"

function Navbar({ scrolled }) {
    return (
        <motion.nav
            className={`cinematic-nav ${scrolled ? "cinematic-nav--scrolled" : ""}`}
            style={{ position: "fixed", top: 0, left: 0, width: "100%" }}
        >
            <div className="cinematic-nav__inner" style={{ display: "flex", alignItems: "center" }}>

                <div style={{ flex: 1 }}>
                    <NavLink to="/" className="cinematic-nav__link">Home</NavLink>
                </div>

                <div style={{ flex: 1, textAlign: "center" }}>
                    <Link to="/" className="cinematic-nav__brand-text">
                        FoundersKick
                    </Link>
                </div>

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

export default function Landing() {
    const [navScrolled, setNavScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="cinematic-landing">

            <Navbar scrolled={navScrolled} />

            <HeroSlider />

            <div
                style={{
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <FoundersKickBackground />
                <div style={{ position: "relative", zIndex: 10 }}>
                    <ShuffleHero />
                </div>
            </div>

            <Footer />

        </div>
    )
}