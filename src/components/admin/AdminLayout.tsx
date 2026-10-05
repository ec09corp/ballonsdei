import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FolderTree, 
  Warehouse, 
  Hammer, 
  CalendarRange, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StoreSettings } from '../../types/database';

export type AdminTab = 
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'customizer'
  | 'inventory'
  | 'production'
  | 'rentals'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onGoToStore: () => void;
  settings: StoreSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onGoToStore,
  settings,
  children,
}) => {
  const { profile, user, signOut, isSupabaseConnected } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Ventas & Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: FolderTree },
    { id: 'customizer', label: 'Personalización de arreglos', icon: Sparkles },
    { id: 'inventory', label: 'Inventario', icon: Warehouse },
    { id: 'production', label: 'Producción & Insumos', icon: Hammer },
    { id: 'rentals', label: 'Alquileres & Reservas', icon: CalendarRange },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] flex flex-col md:flex-row text-[#2E2421]">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#2A211E] text-white p-4 flex items-center justify-between border-b border-[#3E322D]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg tracking-widest font-medium uppercase">
            {settings.store_name || 'BALLONSDEI'}
          </span>
          <span className="text-[9px] bg-[#8D5844] px-1.5 py-0.5 rounded uppercase">Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-white/80 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#231B18] text-[#D5C7C0] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header in sidebar */}
          <div className="p-6 border-b border-[#362B26]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-xl tracking-[0.22em] text-white font-medium block uppercase">
                  {settings.store_name || 'BALLONSDEI'}
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#A68F83] uppercase block mt-0.5">
                  Panel de Gestión
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supabase status badge in sidebar */}
            <div className="mt-4 flex items-center gap-2 px-2.5 py-1 rounded bg-[#2D2320] border border-[#3E312B] text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-[#BBA89E] truncate">
                {isSupabaseConnected ? 'Supabase Activo' : 'Modo Preview'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#8D5844] text-white shadow-sm font-semibold'
                      : 'text-[#B5A49B] hover:bg-[#2F2420] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions footer */}
        <div className="p-4 border-t border-[#362B26] space-y-2">
          <div className="px-3 py-2 bg-[#2D2320] rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8D5844] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-medium text-white block truncate">
                  {profile?.full_name || user?.email || 'Administradora'}
                </span>
                <span className="text-[10px] text-[#A68F83] uppercase tracking-wider block">
                  Rol: Admin
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onGoToStore}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-[#B5A49B] hover:bg-[#2F2420] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Tienda Pública</span>
            </span>
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
