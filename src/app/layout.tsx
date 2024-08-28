// src/app/layout.tsx
import { TRPCReactProvider } from "@/trpc/react";
import { ClientSessionProvider } from "@/components/ClientSessionProvider";
import { getServerAuthSession } from "@/server/auth";
import "@/styles/globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className="h-full">
        <TRPCReactProvider>
          <ClientSessionProvider session={session}>
            {children}
          </ClientSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}