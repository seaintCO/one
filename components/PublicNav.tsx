'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PublicNav(){
  return <header className="one-nav">
    <Link href="/" className="one-logo" aria-label="ONE home">ONE<span>.</span></Link>
    <nav className="one-nav-links" aria-label="Primary navigation">
      <Link href="/features">Features</Link>
      <Link href="/how-it-works">How it works</Link>
      <Link href="/pricing">Pricing</Link>
      <Link href="/login">Log in</Link>
      <Link href="/signup" className="one-nav-cta">Start free <ArrowRight size={14}/></Link>
    </nav>
  </header>
}
