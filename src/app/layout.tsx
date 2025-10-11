import "./globals.css";

export const metadata = { title: "El Silencio del Ciclo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh grid place-items-center bg-black text-green-200">
        {children}
      </body>
    </html>
  );
}
