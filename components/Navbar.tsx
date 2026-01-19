'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    // Only run on homepage
    if (pathname !== '/') return;

    const sections = ['projects', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              setActiveSection(`/#${sectionId}`);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px', // Activate when section is in the middle of viewport
        threshold: 0
      }
    );

    // Observe all sections
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Check if we're at the top (hero section)
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('/');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const isActive = (path: string) => {
    // For non-homepage routes, use pathname matching
    if (pathname !== '/') {
      if (path === '/') return pathname === path;
      return pathname?.startsWith(path);
    }
    
    // For homepage, use active section detection
    return activeSection === path;
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#projects', label: 'Projects' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl md:text-2xl font-bold text-slate-900 hover:text-primary transition-colors"
          >
            NA
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`font-medium transition-colors relative py-1 ${
                  isActive(link.href) 
                    ? 'text-primary' 
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-slide-up">
            <div className="flex flex-col space-y-3">
              {links.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.href) 
                      ? 'text-primary bg-primary/5' 
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
