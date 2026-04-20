import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Bell,
  Calendar,
  GitCompare,
  FileText,
  LogOut,
  ChevronDown,
  Globe
} from 'lucide-react';
import type { PageId, Account, AccountId } from '../../types';
import type { Event } from '../../data/events';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  events: Event[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  currentAccount: Account;
  accounts: Account[];
  onAccountChange: (accountId: AccountId) => void;
  alertCount: number;
}

const navItems: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard; section: 'monitoring' | 'analysis' }> = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, section: 'monitoring' },
  { id: 'zones', label: 'Zones', icon: Layers, section: 'monitoring' },
  { id: 'alerts', label: 'Alertes', icon: Bell, section: 'monitoring' },
  { id: 'history', label: 'Historique', icon: Calendar, section: 'analysis' },
  { id: 'compare', label: 'Comparaison', icon: GitCompare, section: 'analysis' },
  { id: 'report', label: 'Rapport', icon: FileText, section: 'analysis' },
];

export function Sidebar({
  currentPage,
  onNavigate,
  events,
  selectedEventId,
  onSelectEvent,
  currentAccount,
  accounts,
  onAccountChange,
  alertCount
}: SidebarProps) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const liveEvents = events.filter(e => e.status === 'live');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed').slice(0, 5);

  const monitoringItems = navItems.filter(item => item.section === 'monitoring');
  const analysisItems = navItems.filter(item => item.section === 'analysis');

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="font-extralight text-3xl text-gray-900 tracking-tight">HORAMA</div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Flow by Horama</div>
      </div>

      {/* Account Selector */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <button
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-xs">
              {currentAccount.shortName}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{currentAccount.name}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isAccountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden z-50"
              >
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      onAccountChange(account.id);
                      setIsAccountOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                      account.id === currentAccount.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-xs">
                      {account.shortName}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{account.name}</span>
                    {account.id === currentAccount.id && (
                      <svg className="w-4 h-4 text-gray-900 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Event Selector */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Événement</div>
        <button
          onClick={() => setIsEventOpen(!isEventOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="text-left min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {selectedEvent?.status === 'live' && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-gray-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900" />
                </span>
              )}
              <p className="text-sm font-medium text-gray-900 truncate">{selectedEvent?.name || 'Sélectionner'}</p>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{selectedEvent?.subtitle}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${isEventOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isEventOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-white rounded-lg border border-gray-100 overflow-hidden max-h-80 overflow-y-auto"
            >
              {/* Live Events */}
              {liveEvents.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide px-2 py-1">En direct</p>
                  {liveEvents.map((event) => (
                    <EventButton
                      key={event.id}
                      event={event}
                      isSelected={event.id === selectedEventId}
                      onClick={() => {
                        onSelectEvent(event.id);
                        setIsEventOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">À venir</p>
                  {upcomingEvents.map((event) => (
                    <EventButton
                      key={event.id}
                      event={event}
                      isSelected={event.id === selectedEventId}
                      onClick={() => {
                        onSelectEvent(event.id);
                        setIsEventOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Passés</p>
                  {pastEvents.map((event) => (
                    <EventButton
                      key={event.id}
                      event={event}
                      isSelected={event.id === selectedEventId}
                      onClick={() => {
                        onSelectEvent(event.id);
                        setIsEventOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Monitoring Section */}
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monitoring</p>
          <div className="space-y-1">
            {monitoringItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && alertCount > 0 && (
                    <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      {alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Analysis Section */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Analyse</p>
          <div className="space-y-1">
            {analysisItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-gray-900 rounded-r"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">OP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Opérateur</p>
            <p className="text-xs text-gray-500">Connecté</p>
          </div>
          <Globe className="w-4 h-4 text-gray-400" />
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

// Event Button Component
function EventButton({
  event,
  isSelected,
  onClick
}: {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-2 text-left rounded-md transition-colors ${
        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        {event.status === 'live' && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-gray-900" />
        )}
        <p className={`text-sm truncate ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-900'}`}>
          {event.name}
        </p>
      </div>
      <p className="text-xs text-gray-500 truncate mt-0.5 ml-3.5">
        {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {event.subtitle.substring(0, 30)}
      </p>
    </button>
  );
}
