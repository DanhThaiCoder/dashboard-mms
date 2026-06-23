'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from './ThemeToggle'
import {
  User,
  Settings,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export function Header() {

  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 bg-background/80 backdrop-blur-sm shadow-md dark:shadow-white/10 px-4 py-10 md:px-8">
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden flex-1 md:block">
          <div className="search-wrapper relative">
            <Search className="search-icon absolute left-3 top-4 h-4 w-4 z-10" />
            <Input
              placeholder="Search websites..."
              className="search-input pl-10 md:w-[400px]"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="avatar-button relative h-10 w-10 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="avatar-gradient">
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="account-dropdown w-56"
          >
            <DropdownMenuLabel className="dropdown-label">
              My Account
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
              
            <DropdownMenuItem onClick={handleLogout} className="dropdown-item logout-item">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}