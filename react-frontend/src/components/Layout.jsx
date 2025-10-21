// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HeaderProvider, useHeaderActions } from './HeaderContext';

/** Small internal header area that reads current rightNode from context */
function HeaderInner() {
  const { rightNode } = useHeaderActions();

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-40 shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-semibold shadow">SP</div>
              <div>
                <div className="text-base font-semibold">Students Portal</div>
                <div className="text-xs text-slate-400">Connect Resource</div>
              </div>
            </div>
          </div>

          {/* right side slot (pages set this via HeaderContext) */}
          <div>
            {rightNode ? (
              <div className="flex items-center gap-3">
                {rightNode}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  return (
    <HeaderProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <HeaderInner />

        <main className="flex-1">
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white shadow-md rounded-2xl p-6">
              <Outlet />
            </div>
          </div>
        </main>

        <footer className="bg-white border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-center text-sm text-gray-500">
              © {new Date().getFullYear()} Connect Resource
            </div>
          </div>
        </footer>
      </div>
    </HeaderProvider>
  );
}
