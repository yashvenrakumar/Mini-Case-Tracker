import { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { useCasesApi } from '@/hooks/api';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthUser } from '@/redux/slices/authSlice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatTiles } from './components/StatTiles';
import type { DashboardStats } from '@/types';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const user = useAppSelector(selectAuthUser);
  const { getDashboard } = useCasesApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  

  console.log("user-->", user);
  console.log("stats-->", stats);
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboard();
        setStats(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getDashboard]);

  

  if (loading) return <LoadingSpinner fullScreen />;
  if (!stats) return null;

  return (
    <Box sx={{ width: '100%', textAlign: 'left' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }} className="mb-1">
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          {user?.name
            ? `Welcome back, ${user.name} — overview of your case workflow`
            : 'Overview of case statuses across your workflow'}
        </Typography>
      </Box>
      <StatTiles stats={stats} />
    </Box>
  );
};
