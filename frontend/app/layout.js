import './globals.css';

export const metadata = {
  title: 'EliteSport',
  description: 'Plataforma de gestión deportiva',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}