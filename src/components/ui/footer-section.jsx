'use client';
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FacebookIcon, FrameIcon, InstagramIcon, LinkedinIcon, GithubIcon } from 'lucide-react';

const footerLinks = [
    {
        label: 'Platform',
        links: [
            { title: 'Explore Startups', href: '/explore' },
            { title: 'Find Co-Founders', href: '/find-cofounders' },
            { title: 'Launch Startups', href: '/launch-startup' },
            { title: 'Plans & Pricing', href: '/plans' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'About Us', href: '/about' },
            { title: 'FAQs', href: '/faqs' },
            { title: 'Privacy Policy', href: '/privacy' },
            { title: 'Terms of Services', href: '/terms' },
        ],
    },
    {
        label: 'Resources',
        links: [
            { title: 'Blog', href: '/blog' },
            { title: 'Changelog', href: '/changelog' },
            { title: 'Brand', href: '/brand' },
            { title: 'Help', href: '/help' },
        ],
    },
    {
        label: 'Social Links',
        links: [
            { title: 'Facebook', href: '#', icon: FacebookIcon },
            { title: 'Instagram', href: '#', icon: InstagramIcon },
            { title: 'Github', href: '#', icon: GithubIcon },
            { title: 'LinkedIn', href: '#', icon: LinkedinIcon },
        ],
    },
];

export function Footer() {
    return (
        <footer className="footer-card">
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) translateY(-50%)', height: '1px', width: '33%', borderRadius: '9999px', background: 'rgba(255,255,255,0.3)', filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%', height: '8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', filter: 'blur(40px)' }} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Top: Logo + copyright */}
                <AnimatedContainer style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <FrameIcon style={{ width: '2rem', height: '2rem', color: 'white', flexShrink: 0 }} />
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                        © {new Date().getFullYear()} FoundersKick. All rights reserved.
                    </p>
                </AnimatedContainer>

                <div style={{ flex: 1 }} />

                {/* Bottom: 4 columns in one row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', width: '100%' }}>
                    {footerLinks.map((section, index) => (
                        <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                    {section.label}
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {section.links.map((link) => (
                                        <li key={link.title}>
                                            <a
                                                href={link.href}
                                                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', transition: 'color 0.3s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                            >
                                                {link.icon && <link.icon style={{ width: '1rem', height: '1rem' }} />}
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedContainer>
                    ))}
                </div>

            </div>
        </footer >
    );
}

function AnimatedContainer({ className, delay = 0.1, children }) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) return children;
    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}