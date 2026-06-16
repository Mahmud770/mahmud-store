import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Mahmud-Store | أفضل لوحة SMM عربية',
  description: 'منصة Mahmud-Store لخدمات التواصل الاجتماعي - متابعين، لايكات، مشاهدات بأعلى جودة وأقل الأسعار',
  keywords: 'SMM Panel, متابعين, لايكات, مشاهدات, إنستغرام, تيك توك, يوتيوب',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-arabic antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #1e293b', fontFamily: 'Cairo, sans-serif', direction: 'rtl' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
          }}
        />
      </body>
    </html>
  );
}
