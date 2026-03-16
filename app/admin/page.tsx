'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  listUsers,
  updateUserRole,
  listAllReservations,
  checkInReservation,
  checkOutReservation,
  getAnalytics,
  deleteHotel,
} from '@/lib/api/admin';
import { searchHotels } from '@/lib/api/hotels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Users, Building2, Calendar, DollarSign, LogIn, LogOut, Trash2 } from 'lucide-react';

type Tab = 'overview' | 'users' | 'hotels' | 'reservations';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (authLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-96" /></div>;
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        <Button className="mt-4" onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'reservations', label: 'Reservations' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'hotels' && <HotelsTab />}
      {activeTab === 'reservations' && <ReservationsTab />}
    </div>
  );
}

function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAnalytics,
  });

  if (isLoading) return <Skeleton className="h-64" />;
  if (!data) return <p>Failed to load analytics</p>;

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users },
    { label: 'Total Hotels', value: data.totalHotels, icon: Building2 },
    { label: 'Total Reservations', value: data.totalReservations, icon: Calendar },
    { label: 'Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.recentReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.recentReservations.slice(0, 5).map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Room: {res.roomId.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {res.startDate} → {res.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={res.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                      {res.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">${res.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to update role'),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management ({users?.length ?? 0} users)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {users?.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.displayName}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.role === 'ADMIN' ? 'destructive' : u.role === 'STAFF' ? 'default' : 'secondary'}>
                  {u.role}
                </Badge>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={u.role}
                  onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                  disabled={roleMutation.isPending}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HotelsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'hotels'],
    queryFn: () => searchHotels({ size: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHotel(id),
    onSuccess: () => {
      toast.success('Hotel deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hotels'] });
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to delete hotel'),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Management ({data?.totalElements ?? 0} hotels)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {data?.content.map((hotel) => (
            <div key={hotel.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{hotel.name}</p>
                <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
              </div>
              <div className="flex items-center gap-2">
                {hotel.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this hotel? This cannot be undone.')) {
                      deleteMutation.mutate(hotel.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReservationsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['admin', 'reservations', statusFilter],
    queryFn: () => listAllReservations(statusFilter || undefined),
  });

  const checkInMutation = useMutation({
    mutationFn: (id: string) => checkInReservation(id),
    onSuccess: () => {
      toast.success('Guest checked in');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
    onError: (error: Error) => toast.error(error.message || 'Check-in failed'),
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => checkOutReservation(id),
    onSuccess: () => {
      toast.success('Guest checked out');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
    onError: (error: Error) => toast.error(error.message || 'Check-out failed'),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reservations ({reservations?.length ?? 0})</CardTitle>
          <select
            className="text-sm border rounded px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {reservations?.map((res) => (
            <div key={res.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  Reservation {res.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {res.startDate} → {res.endDate} | ${res.totalPrice}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={res.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                  {res.status}
                </Badge>
                {res.status === 'CONFIRMED' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkInMutation.mutate(res.id)}
                      disabled={checkInMutation.isPending}
                    >
                      <LogIn className="w-3 h-3 mr-1" /> Check In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkOutMutation.mutate(res.id)}
                      disabled={checkOutMutation.isPending}
                    >
                      <LogOut className="w-3 h-3 mr-1" /> Check Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
