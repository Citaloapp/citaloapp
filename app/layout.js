import './globals.css';

export const metadata = {
  title: 'Citalo — Turnos médicos online',
  description: 'Reservá turnos con tu profesional de salud de forma rápida y sencilla.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
