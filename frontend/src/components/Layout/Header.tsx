import React from 'react';
import { Bell, User, X, Search } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../UI/ThemeToggle';
import GlobalSearch from '../UI/GlobalSearch';
import NotificationBadge from '../Notifications/NotificationBadge';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { useUser } from '../../contexts/UserContext';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Bem-vindo(a), {user?.name || 'Usuário'}
          </h2>
          <p className="text-sm text-gray-500">
            Hoje é {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Busca Global (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <NotificationBadge 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            />
            
            <NotificationDropdown 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'}
              alt={user?.name || 'Usuário'}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-sm">
              <p className="font-medium text-gray-800">{user?.name || 'Usuário'}</p>
              <p className="text-gray-500 capitalize">{user?.role || 'Usuário'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
}