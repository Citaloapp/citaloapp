import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Citalo — Turnos médicos online',
  description: 'Reservá turnos con tu profesional de salud de forma rápida y sencilla.',
  icons: {
    icon: { url: '/logo-icon.svg', type: 'image/svg+xml' },
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />
      </body>
    </html>
  );
}
