"use client";

import { usePathname } from "next/navigation";
import Activities from "@/components/Activities";
import BottomMenu from "@/components/BottomMenu";
import I18nProvider from "@/components/I18nProvider";
import NavbarWrapper from "@/components/NavbarWrapper";
import PopupModal from "@/components/PopupModal";
import ThemeLoader from "@/app/ThemeLoader";

/** public SEO pages render their own header/footer and must stay in the server HTML (I18nProvider renders nothing until mounted) */
const isPublicContent = (path: string) => path === "/" || path === "/guide" || path.startsWith("/guide/");

export default function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPublicContent(pathname)) return children;

  return (
    <>
      <ThemeLoader />
      <I18nProvider>
        <NavbarWrapper />
        {children}
        <BottomMenu />
        <Activities page="" slot="float_button" />
        <PopupModal />
      </I18nProvider>
    </>
  );
}
