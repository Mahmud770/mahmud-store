import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'King SMM 👑 | أفضل لوحة SMM عربية',
  description: 'منصة King SMM الملكية لخدمات التواصل الاجتماعي - متابعين، لايكات، مشاهدات بأعلى جودة وأقل الأسعار',
  keywords: 'King SMM, SMM Panel, متابعين, لايكات, مشاهدات',
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
            style: {
              background: '#1a1500',
              color: '#f5f0e0',
              border: '1px solid #2a2200',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
            success: { iconTheme: { primary: '#d4a017', secondary: '#1a1500' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1500' } },
          }}
        />
      </body>
    </html>
  );
}
