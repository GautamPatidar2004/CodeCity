import React, { useState } from 'react'
import { Sidebar, type NavItemKey } from './Sidebar'
import { TopHeader } from './TopHeader'
import { LumiAIFloatingButton } from './LumiAIFloatingButton'
import { MobileBottomNav } from './MobileBottomNav'
import { AppShellOverviewView } from '../dashboard/AppShellOverviewView'
import { AppShellDashboardView } from '../dashboard/AppShellDashboardView'
import { FirstTimeDashboardView } from '../dashboard/FirstTimeDashboardView'
import { LearnCatalogView } from '../learn/LearnCatalogView'
import { CourseDetailView } from '../learn/CourseDetailView'
import { QuestsPage } from '../../pages/QuestsPage'
import { ProjectsPage } from '../../pages/ProjectsPage'
import { CommunityPage } from '../../pages/CommunityPage'
import { TeamArcadePage } from '../../pages/TeamArcadePage'
import { GameToaster } from '../ui/GameToast'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'
import {
  Sparkles,
  HelpCircle,
  MessageSquare,
  Camera,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { DashboardMode } from './TopHeader'

export const AppShell: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<NavItemKey>(isAdmin ? 'admin' : 'dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('headquarters')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const isLevel1 = dashboardMode === 'first_time'

  return (
    <div className="min-h-screen w-full bg-[#faf8f4] text-stone-900 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* 1. LEFT PERSISTENT SIDEBAR (Desktop / Tablet) */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab)
            if (tab !== 'learn') setSelectedCourseId(null)
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onContinueQuest={() => {
            setActiveTab('learn')
            setSelectedCourseId('python')
          }}
          userMode={isLevel1 ? 'level1' : 'level12'}
          isAdmin={isAdmin}
        />
      </div>

      {/* 2. MAIN APPLICATION COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Compact Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab)
            if (tab !== 'learn') setSelectedCourseId(null)
          }}
          dashboardMode={dashboardMode}
          onChangeDashboardMode={setDashboardMode}
          courseDetailTitle={
            activeTab === 'learn' && selectedCourseId
              ? 'Course / Python Adventure'
              : null
          }
          onOpenLumi={() => {
            // Trigger floating Lumi button click or highlight
            const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
            btn?.click()
          }}
        />

        {/* Dynamic Content Area (Ivory/Cream Canvas with Clean Surfaces) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <>
              {dashboardMode === 'overview' && (
                <AppShellOverviewView
                  onNavigateTab={(tab) => {
                    setActiveTab(tab)
                    if (tab === 'learn') setSelectedCourseId('python')
                  }}
                />
              )}
              {dashboardMode === 'headquarters' && (
                <AppShellDashboardView
                  onNavigateTab={(tab) => {
                    setActiveTab(tab)
                    if (tab === 'learn') setSelectedCourseId('python')
                  }}
                />
              )}
              {dashboardMode === 'first_time' && (
                <FirstTimeDashboardView
                  onNavigateTab={(tab) => {
                    setActiveTab(tab)
                    if (tab === 'learn') setSelectedCourseId('python')
                  }}
                  onStartFirstQuest={() => {
                    setActiveTab('learn')
                    setSelectedCourseId('python')
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'learn' && (
            <>
              {selectedCourseId ? (
                <CourseDetailView
                  onBackToCourses={() => setSelectedCourseId(null)}
                  onStartQuest={() => {
                    setActiveTab('practice')
                  }}
                  onOpenLumi={() => {
                    const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
                    btn?.click()
                  }}
                />
              ) : (
                <LearnCatalogView
                  onSelectCourse={(courseId) => {
                    setSelectedCourseId(courseId)
                  }}
                  onOpenLumi={() => {
                    const btn = document.querySelector('button[title="Ask Lumi AI Mentor"]') as HTMLButtonElement | null
                    btn?.click()
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'practice' && <QuestsPage />}

          {activeTab === 'build' && <ProjectsPage />}

          {activeTab === 'arcade' && <TeamArcadePage />}

          {activeTab === 'community' && <CommunityPage />}

          {activeTab === 'settings' && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-left animate-in fade-in pb-12">
              <div className="p-6 bg-white rounded-3xl border border-[#ece7df] shadow-xs flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group cursor-pointer">
                  <AlexPixelAvatar size={72} />
                  <div className="absolute inset-0 bg-stone-900/60 rounded-xl hidden group-hover:flex flex-col items-center justify-center transition-all animate-in fade-in">
                    <Camera className="w-5 h-5 text-white mb-0.5" />
                    <span className="text-[9px] font-bold text-white uppercase font-pixel text-center leading-tight">Edit<br/>Avatar</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-2xl font-black text-stone-900">{user?.user_metadata?.full_name || 'Alex Morgan'}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-pixel font-bold">
                      LVL 12
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    @{user?.user_metadata?.username || 'alex_dev'} • {user?.email || 'alex.morgan@codingconflicts.dev'}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 italic">
                    "Passionate adventurer in the world of code. Learning Python and preparing to build full-stack web apps!"
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono">
                      ⭐ 4,850 XP
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold font-mono">
                      🔥 7 Day Streak
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold font-mono">
                      ⚔️ 14 Quests Done
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="p-6 bg-white rounded-3xl border border-[#ece7df] shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-stone-900 font-pixel uppercase">Adventurer Profile Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-stone-700">Display Name</label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.full_name || 'Alex Morgan'}
                      className="h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-stone-700">Username</label>
                    <input
                      type="text"
                      defaultValue={user?.user_metadata?.username || 'alex_dev'}
                      className="h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-bold text-stone-700">Bio</label>
                    <textarea
                      rows={3}
                      defaultValue="Passionate adventurer in the world of code. Learning Python and preparing to build full-stack web apps!"
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-900 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-stone-700">Primary Track</label>
                    <select
                      defaultValue="Python"
                      className="h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="Python">Python Adventure</option>
                      <option value="JavaScript">JavaScript Game Dev</option>
                      <option value="AI">AI & Machine Learning</option>
                      <option value="React">React Web Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <span className="text-xs text-stone-500">Changes are automatically saved to your character profile.</span>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-left animate-in fade-in pb-12">
              <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#ece7df] shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-900">Help & Support Realm</h2>
                    <p className="text-xs text-stone-500 font-medium">Guides, documentation, and mentorship assistance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ece7df] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Lumi AI Assistant</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Need immediate help on syntax errors, quest hints, or coding explanations? Click &quot;Ask Lumi&quot; on the bottom right.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fbf9f4] border border-[#ece7df] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span>Community Discussions</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Connect with fellow learners, exchange feedback, and share your project builds in the Community Realm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. GLOBAL FLOATING LUMI AI BUTTON */}
      <LumiAIFloatingButton />

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 5. GLOBAL GAME TOASTER FOR AUDIO-VISUAL FEEDBACK */}
      <GameToaster />
    </div>
  )
}
