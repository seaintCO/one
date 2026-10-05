import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegister from '@/components/PWARegister';
import { GlobalLanguageToggle, LanguageProvider } from '@/components/LanguageProvider';
import { GlobalThemeToggle, ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'ONE — Business, beautifully simple.',
  description: 'Your business phone, CRM, payments, translation and follow-up in one beautifully simple workspace.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ONE' },
  icons: { icon: '/icons/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#050505', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <PWARegister />
            {children}
            <div className="global-preference-toolbar">
              <GlobalThemeToggle />
              <GlobalLanguageToggle />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
