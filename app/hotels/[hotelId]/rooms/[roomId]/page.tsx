"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRoomById } from '@/lib/api/hotels';
import { BookingForm } from '@/components/BookingForm';
import { Room } from '@/lib/types/hotel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';

export default function RoomBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const hotelId = params?.hotelId as string | undefined;
  const roomId = params?.roomId as string | undefined;

  useEffect(() => {
    // Wait until auth state is resolved before deciding to redirect
    if (authLoading) return;

    if (!isAuthenticated) {
      const redirect = `/hotels/${hotelId ?? ''}/rooms/${roomId ?? ''}?checkIn=${checkIn}&checkOut=${checkOut}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (!roomId) {
      setLoading(false);
      return;
    }

    getRoomById(roomId, hotelId)
      .then(setRoom)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, roomId, hotelId, checkIn, checkOut, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Room not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Room Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{room.type}</h1>
          
          <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
            <p className="text-muted-foreground">Room Image</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{room.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{room.capacity} guests</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities?.split(',').map((amenity, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {amenity.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Base Rate</span>
                  <span className="text-2xl font-bold">${room.basePrice}/night</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Complete Your Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingForm
                roomId={roomId ?? ''}
                hotelId={hotelId ?? ''}
                defaultCheckIn={checkIn}
                defaultCheckOut={checkOut}
                basePrice={room.basePrice}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
