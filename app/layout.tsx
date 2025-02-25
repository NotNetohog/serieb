import './globals.css';

export const metadata = {
  title: {
    default: 'brasileirão - série B',
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="flex flex-col min-h-screen text-black dark:text-white bg-white dark:bg-black antialiased">
        <div className="flex-grow overflow-y-scroll h-[calc(100vh_-_80px)] border-b border-gray-200 dark:border-gray-800 pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
