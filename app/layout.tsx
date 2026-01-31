import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnalyticsTracker from '../components/AnalyticsTracker';

export const metadata: Metadata = {
  title: "Jesús Díaz Automotores",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#05030a] text-slate-100 overflow-x-hidden">
        <Header />
        <AnalyticsTracker />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
