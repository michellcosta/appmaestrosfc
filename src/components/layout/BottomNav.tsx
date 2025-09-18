import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSessionProfile } from '@/hooks/useSessionProfile';
import { useMenuByRole } from '@/hooks/useMenuByRole';

export default function BottomNav() {
  const { profile } = useSessionProfile();
  const items = useMenuByRole(profile);
  const { pathname } = useLocation();

  if (!items || items.length === 0) return null;

  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40"
      aria-label="Navegação inferior"
    >
      <div className="mx-auto max-w-4xl px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-2xl border border-zinc-200 bg-white/95 dark:bg-zinc-900/85 backdrop-blur shadow-lg">
          <ul className="grid grid-cols-4 gap-1 p-2">
            {items.slice(0, 4).map((it) => {
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <NavLink
                    to={it.href}
                    className={[
                      "block text-center text-xs rounded-xl px-2 py-2 transition",
                      active
                        ? "bg-zinc-100 dark:bg-zinc-800 font-semibold"
                        : "hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
                    ].join(" ")}
                  >
                    {it.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
