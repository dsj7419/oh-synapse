import { TRPCReactProvider } from "@/trpc/react";
import { ClientSessionProvider } from "@/components/ClientSessionProvider";
import { getServerAuthSession } from "@/server/auth";
import { Navigation } from "@/components/Navigation";
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
            <Navigation />
            <div className="mt-16"> {/* Add top margin to account for fixed navbar */}
              {children}
            </div>
          </ClientSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}