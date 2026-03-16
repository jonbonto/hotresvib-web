'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getHotelReviews, getHotelRating, createReview, deleteReview } from '@/lib/api/reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Star, Trash2 } from 'lucide-react';

interface HotelReviewsProps {
  hotelId: string;
}

export function HotelReviews({ hotelId }: HotelReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', hotelId],
    queryFn: () => getHotelReviews(hotelId),
  });

  const { data: ratingData } = useQuery({
    queryKey: ['rating', hotelId],
    queryFn: () => getHotelRating(hotelId),
  });

  const createMutation = useMutation({
    mutationFn: () => createReview({ hotelId, rating, comment: comment || undefined }),
    onSuccess: () => {
      toast.success('Review submitted!');
      setShowForm(false);
      setRating(5);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['rating', hotelId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['rating', hotelId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Reviews</h2>
          {ratingData && ratingData.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(ratingData.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span>{ratingData.averageRating.toFixed(1)} ({ratingData.reviewCount} reviews)</span>
            </div>
          )}
        </div>
        {isAuthenticated && !showForm && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 cursor-pointer ${s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment (optional)</Label>
                <Input
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.userName}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {user && user.id === review.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(review.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to review this hotel!
        </p>
      )}
    </div>
  );
}
