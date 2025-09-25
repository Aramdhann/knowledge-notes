import { Geist, Geist_Mono, Pixelify_Sans } from 'next/font/google';
import './globals.css';
import Providers from './provider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const pixelifySans = Pixelify_Sans({
    subsets: ['latin'],
    variable: '--font-pixelify-sans',
});

export const metadata = {
    title: 'Knowledge Notes by Radit',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${pixelifySans.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
