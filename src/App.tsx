import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Bell,
  Calendar,
  GitCompare,
  FileText,
  Menu,
  X,
  ChevronDown,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Zones } from './pages/Zones';
import { Alerts } from './pages/Alerts';
import { History } from './pages/History';
import { Compare } from './pages/Compare';
import { Report } from './pages/Report';
import { eventsDatabase, accounts, getEventsByAccount } from './data/events';
import type { PageId, AccountId } from './types';
import type { Event } from './data/events';

// Bottom Navigation Component for Mobile
function BottomNav({
  currentPage,
  onNavigate,
  alertCount
}: {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  alertCount: number;
}) {
  const items = [
    { id: 'dashboard' as PageId, label: 'Accueil', icon: LayoutDashboard },
    { id: 'zones' as PageId, label: 'Zones', icon: Layers },
    { id: 'alerts' as PageId, label: 'Alertes', icon: Bell, badge: alertCount },
    { id: 'history' as PageId, label: 'Historique', icon: Calendar },
    { id: 'report' as PageId, label: 'Rapport', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-0"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [currentAccountId, setCurrentAccountId] = useState<AccountId>('stade-france');
  const [events, setEvents] = useState<Event[]>(eventsDatabase);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  // Get events for current account
  const accountEvents = useMemo(() => {
    return events.filter(e => e.accountId === currentAccountId);
  }, [events, currentAccountId]);

  // Get live event or first event for current account
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    const accountEvts = getEventsByAccount('stade-france');
    const liveEvent = accountEvts.find(e => e.status === 'live');
    return liveEvent?.id || accountEvts[0]?.id || '';
  });

  // Update selected event when account changes
  const handleAccountChange = useCallback((accountId: AccountId) => {
    setCurrentAccountId(accountId);
    const accountEvts = getEventsByAccount(accountId);
    const liveEvent = accountEvts.find(e => e.status === 'live');
    setSelectedEventId(liveEvent?.id || accountEvts[0]?.id || '');
  }, []);

  const handleUpdateAlert = useCallback((alertId: string, acknowledged: boolean) => {
    setEvents(prevEvents =>
      prevEvents.map(event => ({
        ...event,
        alerts: event.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged } : alert
        )
      }))
    );
  }, []);

  const selectedEvent = useMemo(() => {
    return accountEvents.find(e => e.id === selectedEventId) || accountEvents[0];
  }, [accountEvents, selectedEventId]);

  const currentAccount = accounts.find(a => a.id === currentAccountId)!;
  const alertCount = selectedEvent?.alerts.filter(a => !a.acknowledged).length || 0;

  const liveEvents = accountEvents.filter(e => e.status === 'live');
  const upcomingEvents = accountEvents.filter(e => e.status === 'upcoming');
  const pastEvents = accountEvents.filter(e => e.status === 'completed').slice(0, 5);

  const getEventStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'live': return <Radio className="w-4 h-4 text-rose-500" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const renderPage = () => {
    if (!selectedEvent) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-slate-500">Aucun événement disponible</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard event={selectedEvent} />;
      case 'zones':
        return <Zones event={selectedEvent} />;
      case 'alerts':
        return <Alerts event={selectedEvent} onUpdateAlert={handleUpdateAlert} />;
      case 'history':
        return <History events={accountEvents} selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} />;
      case 'compare':
        return <Compare events={accountEvents} />;
      case 'report':
        return <Report event={selectedEvent} />;
      default:
        return <Dashboard event={selectedEvent} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          events={accountEvents}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          currentAccount={currentAccount}
          accounts={accounts}
          onAccountChange={handleAccountChange}
          alertCount={alertCount}
        />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Event Selector */}
          <button
            onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full max-w-[200px]"
          >
            {selectedEvent?.status === 'live' && (
              <span className="flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
            <span className="text-sm font-medium text-gray-900 truncate">{selectedEvent?.name || 'Événement'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${eventDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="w-10" />
        </div>

        {/* Mobile Event Dropdown */}
        <AnimatePresence>
          {eventDropdownOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/20 z-40"
                onClick={() => setEventDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[60vh] overflow-y-auto"
              >
                {/* Live Events */}
                {liveEvents.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">En direct</p>
                    {liveEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEventId(event.id); setEventDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedEventId === event.id ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
                      >
                        {getEventStatusIcon(event.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                          <p className="text-xs text-gray-500 truncate">{event.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">À venir</p>
                    {upcomingEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEventId(event.id); setEventDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedEventId === event.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        {getEventStatusIcon(event.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-600 truncate">{event.name}</p>
                          <p className="text-xs text-gray-400 truncate">{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide px-2 mb-1">Passés</p>
                    {pastEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => { setSelectedEventId(event.id); setEventDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left ${selectedEventId === event.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                      >
                        {getEventStatusIcon(event.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.name}</p>
                          <p className="text-xs text-gray-500 truncate">{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div>
                  <div className="font-extralight text-2xl text-gray-900 tracking-tight">HORAMA</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Flow</div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Account Selector in Mobile Sidebar */}
              <div className="p-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Compte</p>
                <div className="space-y-1">
                  {accounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => { handleAccountChange(account.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        account.id === currentAccountId ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-semibold text-xs">
                        {account.shortName}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{account.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation in Mobile Sidebar */}
              <nav className="p-4">
                <div className="mb-6">
                  <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Monitoring</p>
                  <div className="space-y-1">
                    {[
                      { id: 'dashboard' as PageId, label: 'Tableau de bord', icon: LayoutDashboard },
                      { id: 'zones' as PageId, label: 'Zones', icon: Layers },
                      { id: 'alerts' as PageId, label: 'Alertes', icon: Bell, badge: alertCount },
                    ].map(item => {
                      const isActive = currentPage === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg ${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Analyse</p>
                  <div className="space-y-1">
                    {[
                      { id: 'history' as PageId, label: 'Historique', icon: Calendar },
                      { id: 'compare' as PageId, label: 'Comparaison', icon: GitCompare },
                      { id: 'report' as PageId, label: 'Rapport', icon: FileText },
                    ].map(item => {
                      const isActive = currentPage === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg ${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen pt-14 pb-20 lg:pt-0 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${selectedEventId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        alertCount={alertCount}
      />
    </div>
  );
}

export default App;
