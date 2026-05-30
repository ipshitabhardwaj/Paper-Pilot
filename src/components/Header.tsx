import { Eye, GraduationCap, Github } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  hasActivePaper: boolean;
}

export default function Header({ onReset, hasActivePaper }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E5E1] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div 
          onClick={onReset}
          className="flex cursor-pointer items-center space-x-3 transition active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#1A1A1A] text-white">
            <GraduationCap className="h-5 w-5 text-[#FDFDFB]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif italic text-2xl font-bold tracking-tighter text-[#1A1A1A]">
                PaperPilot
              </span>
              <span className="rounded-none bg-[#F5F5F0] px-2 py-0.5 font-mono text-[9px] font-bold text-[#1A1A1A] border border-[#E5E5E1]">
                v1.0
              </span>
            </div>
            <p className="text-[9px] text-[#888880] font-mono tracking-[0.15em] uppercase">
              Scientific Peer Synthesis Engine
            </p>
          </div>
        </div>

        {/* Global actions and branding status */}
        <div className="flex items-center space-x-3">
          {hasActivePaper && (
            <button
              onClick={onReset}
              className="px-4 py-2 border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors duration-150 rounded-none bg-white text-[#1A1A1A]"
            >
              Upload New Paper
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex h-8 w-8 items-center justify-center rounded-none border border-transparent text-[#888880] hover:text-black transition"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>

      </div>
    </header>
  );
}
