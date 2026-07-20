"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDE_NAVBAR_PAGES = ["/login", "/register"];

export default function NavbarWrapper() {
  const pathname = usePathname();

  if (HIDE_NAVBAR_PAGES.includes(pathname)) return null;

  return <Navbar />;
}