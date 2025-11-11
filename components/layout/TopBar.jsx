'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, Calculator, Megaphone, Settings, LogOut } from 'lucide-react'
import BroadcastNotification from '@/components/notifications/BroadcastNotification'

export default function TopBar({ user, school, activeTab, onCalculatorOpen, onLogout, onMenuClick, onSettingsClick }) {
  return (
    <div className="bg-white shadow-md h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-100">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 hover:text-gray-900 mr-4 p-2 rounded-xl hover:bg-gray-100 transition-all">
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          {user.role !== 'developer' && school && (
            <Badge className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
              {school.name}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {user.role === 'school_admin' && (
          <BroadcastNotification
            currentUser={user}
            trigger={
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all" size="sm">
                <Megaphone className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
            }
          />
        )}
        <button onClick={onCalculatorOpen} className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all text-gray-600 hover:text-purple-600 group">
          <Calculator className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all group">
              <Avatar className="h-9 w-9 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role === 'school_admin' ? 'Admin' : user.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <Badge variant="secondary" className="text-xs w-fit capitalize">
                  {user.role === 'school_admin' ? 'Admin' : user.role.replace('_', ' ')}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === 'school_admin' && (
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
