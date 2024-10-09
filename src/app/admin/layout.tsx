import AdminSideBar from '@/components/admin/AdminSideBar.component';
import { Navigation } from "@/components/common/Navigation.component";
import { ThemeProvider } from '@/context/ThemeContext';
import { Flex, Box } from '@radix-ui/themes';
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
          <Box style={{ flex: 1, padding: '0px', marginTop: '0px' }}>
            {children}
          </Box>
        </Flex>
      </Box>
    </ThemeProvider>
  );
}