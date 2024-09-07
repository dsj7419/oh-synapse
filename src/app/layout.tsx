import { TRPCReactProvider } from "@/trpc/react";
import { ClientSessionProvider } from "@/components/common/ClientSessionProvider.component";
import { getAuthSession } from "@/server/auth";
import { Navigation } from "@/components/common/Navigation.component";
import "@/styles/globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/server/uploadthing";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className="h-full">
        <TRPCReactProvider>
          <ClientSessionProvider session={session}>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <Navigation />
            <div className="mt-16">
              {children}
            </div>
          </ClientSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}