// app/layout.tsx
import '../styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Zostel Trip Comparison',
  description: 'MVP'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800">{children}</body>
    </html>
  );
}
