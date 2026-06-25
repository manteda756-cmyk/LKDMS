import { Noto_Sans_Ethiopic, Noto_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  variable: '--font-noto',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'የፋይል ማውጫ ስርዓት | File Index System',
  description: 'Government Office File Index Management System - Ethiopia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="am" suppressHydrationWarning>
      <body className={`${notoEthiopic.variable} ${notoSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
