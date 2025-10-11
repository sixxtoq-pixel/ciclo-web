import "./globals.css";

export const metadata = { title: "El Silencio del Ciclo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      {/* El body ya no necesita grid; el panel se centra solo con un overlay fixed */}
      <body className="bg-black text-green-200">{children}</body>
    </html>
  );
}
