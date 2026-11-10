import type { Metadata } from "next";
import { AppSidebar } from "@/components/app/AppSidebar";
import { CommandPalette } from "@/components/app/CommandPalette";
import { AppTabBar, AppTopBar } from "@/components/app/AppMobileBar";
import { StorageNotice } from "@/components/app/StorageNotice";
import { WelcomeTour } from "@/components/app/WelcomeTour";
import { SkipLink } from "@/components/ui/SkipLink";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: { default: "Demo workspace", template: "%s | Unbusy demo" },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SkipLink />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />
        <StorageNotice />
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 md:px-8 md:pt-8 md:pb-12"
        >
          {children}
        </main>
      </div>
      <AppTabBar />
      <Toaster />
      <CommandPalette />
      <WelcomeTour />
    </div>
  );
}
