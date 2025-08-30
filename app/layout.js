// app/layout.js
/*import "./globals.css";

export const metadata = {
  title: "NerdNest Solutions",
  description: "Precision in Word. Power in Code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
*/
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "NerdNest Solutions",
  description: "Precision in Word. Power in Code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Analytics />

      </body>
    </html>
  );
}

