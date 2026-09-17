import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EXPERT ERP',
  description: 'Painel do ERP e PDV web para o piloto supermercadista do RN',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
