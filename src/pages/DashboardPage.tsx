import React from 'react'
import { useAuth } from '../context/AuthContext'
import { LearnerDashboard } from '../components/dashboard/LearnerDashboard'
import { AdminDashboard } from '../components/dashboard/AdminDashboard'

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth()

  return isAdmin ? <AdminDashboard /> : <LearnerDashboard />
}
