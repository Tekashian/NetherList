import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'NetherList — Game Trading Marketplace',
  description: 'Trade in-game items across Diablo II, Path of Exile, and other ARPGs. Paste item text directly from game, list in seconds.',
  keywords: ['Diablo 2', 'D2R', 'Path of Exile', 'trading', 'marketplace', 'ARPG items'],
};

export const viewport: Viewport = {
  themeColor: '#080808',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
