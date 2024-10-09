import AdminSideBar from '@/components/admin/AdminSideBar.component';
import AdminMobileNav from '@/components/admin/AdminMobileNav.component';
import { Navigation } from "@/components/common/Navigation.component";
import { ThemeProvider } from '@/context/ThemeContext';
import { Flex, Box, ScrollArea } from '@radix-ui/themes';
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/server/uploadthing";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Box style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Navigation />
        <Flex>
          <AdminSideBar />
          <ScrollArea style={{ flex: 1, height: 'calc(100vh - 64px)' }}>
            <Box style={{ padding: '16px', marginTop: '64px' }}>
              {children}
            </Box>
          </ScrollArea>
        </Flex>
        <AdminMobileNav />
      </Box>
    </ThemeProvider>
  );
}