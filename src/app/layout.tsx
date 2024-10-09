import { TrpcProvider } from "@/components/common/TrpcProvider.component";
import { ClientSessionProvider } from "@/components/common/ClientSessionProvider.component";
import { Navigation } from "@/components/common/Navigation.component";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/styles/globals.css";
import type { ReactNode } from "react";
import { getAuthSession } from "@/server/auth";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/server/uploadthing";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuthSession();
  return (
    <html lang="en">
      <body>
        <TrpcProvider>
          <ClientSessionProvider session={session}>
            <ThemeProvider>
              <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
              <Navigation />
              <div className="mt-16">
                {children}
              </div>
            </ThemeProvider>
          </ClientSessionProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}