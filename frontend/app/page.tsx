'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) fetchUser(token);
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch {
      console.error('Auth check failed');
    }
  };

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!mounted) return null;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(220,38,38,0.4)',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Georgia, serif' }}>N</span>
            </div>
            <span style={{ fontFamily: 'Cinzel, Georgia, serif', fontWeight: 600, fontSize: 18, color: '#e5e5e5', letterSpacing: '0.02em' }}>
              NetherList
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['Browse', 'Games', 'How it works'].map(link => (
              <a key={link} href="#" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#71717a', textDecoration: 'none' }}>{link}</a>
            ))}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.username?.[0]?.toUpperCase() || 'U'}</div>
                <span style={{ color: '#e5e5e5', fontSize: 14, fontWeight: 500 }}>{user.username}</span>
                <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 16px', fontSize: 13 }}>Log out</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Sign in with Google</button>
            )}
          </div>
        </div>
      </nav>

      <main style={{ minHeight: '100vh', background: '#080808', overflowX: 'hidden' }}>

        <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 120, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(220,38,38,0.1) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 999, border: '1px solid rgba(220,38,38,0.28)', background: 'rgba(220,38,38,0.07)', marginBottom: 36, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#f87171' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              ARPG Trading Marketplace
            </div>
            <h1 style={{ fontSize: 'clamp(42px, 7vw, 82px)', fontWeight: 700, lineHeight: 1.08, marginBottom: 24, fontFamily: 'Cinzel, Georgia, serif', background: 'linear-gradient(170deg, #ffffff 20%, #a1a1aa 95%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em' }}>
              Trade Items.<br />
              <span style={{ background: 'linear-gradient(135deg, #ef4444 10%, #dc2626 50%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>No Middleman.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#71717a', lineHeight: 1.75, fontWeight: 400, maxWidth: 520, margin: '0 auto 48px' }}>
              Copy item text from game, paste into NetherList — stats parsed instantly. Trade across Diablo II, Path of Exile, and more.
            </p>
            {authError && (
              <div style={{ marginBottom: 20, padding: '12px 20px', borderRadius: 10, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 14 }}>
                Authentication failed — please try again.
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>Go to Dashboard →</button>
              ) : (
                <>
                  <button onClick={handleLogin} className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>Continue with Google</button>
                  <button className="btn-ghost" style={{ fontSize: 15, padding: '14px 28px' }}>Browse listings</button>
                </>
              )}
            </div>
          </div>
        </section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ padding: '28px 20px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#e5e5e5', lineHeight: 1, fontFamily: 'Cinzel, Georgia, serif' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#3f3f46', marginTop: 6, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section style={{ padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#3f3f46', marginBottom: 32 }}>Supported Games</p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
              {games.map((g, i) => (
                <div key={i} style={{ padding: '10px 18px', borderRadius: 10, background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d8' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: '#3f3f46' }}>{g.tag}</div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginLeft: 4, ...(g.active ? { background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.22)' } : { background: 'rgba(255,255,255,0.04)', color: '#52525b', border: '1px solid rgba(255,255,255,0.06)' }) }}>{g.active ? 'Live' : 'Soon'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#e5e5e5', marginBottom: 12, fontFamily: 'Cinzel, Georgia, serif' }}>List in 30 Seconds</h2>
              <p style={{ color: '#52525b', fontSize: 15 }}>No manual entry. Copy from game, paste, done.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', background: 'rgba(255,255,255,0.03)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ padding: '40px 32px', background: '#080808', borderRight: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(220,38,38,0.09)', border: '1px solid rgba(220,38,38,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 20 }}>{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Step {i + 1}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: '#e5e5e5', marginBottom: 10, fontFamily: 'Cinzel, Georgia, serif' }}>{step.title}</h3>
                  <p style={{ color: '#52525b', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#e5e5e5', marginBottom: 12, fontFamily: 'Cinzel, Georgia, serif' }}>Built for Traders</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {features.map((f, i) => (
                <div key={i} className="card">
                  <div style={{ width: 44, height: 44, borderRadius: 10, marginBottom: 20, background: `rgba(${f.rgb},0.09)`, border: `1px solid rgba(${f.rgb},0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '64px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#3f3f46', marginBottom: 24 }}>Diablo II Item Colors</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {itemColors.map((c, i) => (
                <span key={i} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: c.color, background: `${c.color}16`, border: `1px solid ${c.color}28`, fontFamily: 'monospace' }}>{c.label}</span>
              ))}
            </div>
          </div>
        </section>

        {!user && (
          <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '60px 40px', borderRadius: 20, background: 'linear-gradient(160deg, #0f0606 0%, #080808 100%)', border: '1px solid rgba(220,38,38,0.18)' }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, color: '#e5e5e5', marginBottom: 14, fontFamily: 'Cinzel, Georgia, serif' }}>Ready to Trade?</h2>
              <p style={{ color: '#52525b', fontSize: 15, marginBottom: 32 }}>Join thousands of players. Free forever.</p>
              <button onClick={handleLogin} className="btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>Start for Free</button>
            </div>
          </section>
        )}

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '36px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ color: '#3f3f46', fontSize: 14, fontFamily: 'Cinzel, Georgia, serif' }}>NetherList</span>
            <p style={{ color: '#3f3f46', fontSize: 12 }}>© 2026 NetherList — Not affiliated with Blizzard or GGG.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy', 'Terms', 'Discord'].map(l => (
                <a key={l} href="#" style={{ color: '#3f3f46', fontSize: 13, textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

const stats = [
  { value: '14k+',   label: 'Items Listed' },
  { value: '3,200+', label: 'Trades Done' },
  { value: '4',      label: 'Games' },
  { value: 'Free',   label: 'Always' },
];

const games = [
  { icon: '🔥', name: 'Diablo II: Resurrected', tag: 'D2R',  active: true },
  { icon: '⚡', name: 'Path of Exile',           tag: 'PoE',  active: false },
  { icon: '💀', name: 'Diablo IV',                tag: 'D4',   active: false },
  { icon: '🌑', name: 'Path of Exile 2',          tag: 'PoE2', active: false },
];

const steps = [
  { icon: '📋', title: 'Copy Item',     desc: 'Hover an item in-game and press Ctrl+C to copy the full item text.' },
  { icon: '⚡', title: 'Paste & Parse', desc: 'Paste into NetherList. Stats, affixes, and item tier read automatically.' },
  { icon: '💰', title: 'Set Price',     desc: 'Name your price in Runes or High Runes. List in one click.' },
  { icon: '🤝', title: 'Trade',         desc: 'Buyers message you directly. Complete in-game, rate the experience.' },
];

const features = [
  { icon: '🔍', title: 'Smart Item Parser',   desc: 'Paste raw item text — every stat extracted automatically. Works with D2R item format.', rgb: '220,38,38' },
  { icon: '🛡️', title: 'Reputation System',  desc: 'Rate trading partners. Build trust through completed trades and reviews.', rgb: '245,158,11' },
  { icon: '💬', title: 'Direct Messages',     desc: 'Real-time chat with sellers. No Discord DMs — everything in one place.', rgb: '99,102,241' },
  { icon: '🔎', title: 'Advanced Filtering',  desc: 'Filter by item type, stats, sockets, rune words, price range and more.', rgb: '34,197,94' },
  { icon: '📊', title: 'Price History',       desc: 'Watch how item prices evolve. Know when to buy and when to hold.', rgb: '14,165,233' },
  { icon: '🔔', title: 'Alerts & Watchlists', desc: 'Get notified the moment an item matching your criteria gets listed.', rgb: '168,85,247' },
];

const itemColors = [
  { label: 'Normal',    color: '#e5e5e5' },
  { label: 'Magic',     color: '#6969ff' },
  { label: 'Rare',      color: '#ffff00' },
  { label: 'Set',       color: '#00c800' },
  { label: 'Unique',    color: '#a59263' },
  { label: 'Crafted',   color: '#ff8040' },
  { label: 'Rune Word', color: '#ed9121' },
  { label: 'Ethereal',  color: '#9cacbc' },
];
