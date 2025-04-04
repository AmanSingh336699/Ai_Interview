// components/layouts/BattleLayout.tsx
import { ReactNode } from "react";
import Image from "next/image";

interface BattleLayoutProps {
  children: ReactNode;
}

export default function BattleLayout({ children }: BattleLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from text-white flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/battleImage.jpeg"
          alt="Battle Arena Background"
          fill
          loading="lazy"
          className="opacity-40 object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}