import "./globals.css";

export const metadata = { title: "El Silencio del Ciclo", description: "Terminal narrativa — web app" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0f0c" />
      </head>
      <body className="bg-black text-green-200">{children}</body>
    </html>
  );
}
