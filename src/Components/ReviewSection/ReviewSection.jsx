import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'; // For star ratings and like/dislike icons
import { Link } from 'react-router-dom'; // Import Link for login prompt

const API_BASE_URL = "http://localhost:5000/api";

const ReviewSection = ({ productId }) => {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFormError, setReviewFormError] = useState('');

  const [replyText, setReplyText] = useState({}); // State to manage reply text for each review
  const [isSubmittingReply, setIsSubmittingReply] = useState({}); // State to manage reply submission for each review
  const [replyFormError, setReplyFormError] = useState({});

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews.');
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviewsError("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Handle new review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFormError('');
    if (!user || !firebaseUser) {
      setReviewFormError('You must be logged in to post a review.');
      return;
    }
    if (newRating === 0) {
      setReviewFormError('Please provide a rating.');
      return;
    }
    if (!newComment.trim()) {
      setReviewFormError('Please write a comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(prev => [data, ...prev]); // Add new review to the top
        setNewRating(0);
        setNewComment('');
      } else {
        setReviewFormError(data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewFormError('Network error or server unavailable.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (reviewId, e) => {
    e.preventDefault();
    setReplyFormError(prev => ({ ...prev, [reviewId]: '' }));
    if (!user || !firebaseUser) {
      setReplyFormError(prev => ({ ...prev, [reviewId]: 'You must be logged in to reply.' }));
      return;
    }
    if (!replyText[reviewId]?.trim()) {
      setReplyFormError(prev => ({ ...prev, [reviewId]: 'Please write a reply.' }));
      return;
    }

    setIsSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ replyText: replyText[reviewId] }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(prev => prev.map(review =>
          review._id === reviewId ? { ...review, replies: data.replies } : review
        ));
        setReplyText(prev => ({ ...prev, [reviewId]: '' })); // Clear reply text
      } else {
        setReplyFormError(prev => ({ ...prev, [reviewId]: data.message || 'Failed to submit reply.' }));
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      setReplyFormError(prev => ({ ...prev, [reviewId]: 'Network error or server unavailable.' }));
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Helper to render stars
  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  // Helper to render user avatar
  const renderAvatar = (photoURL, name) => (
    photoURL ? (
      <img src={photoURL} alt={name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
        {name?.charAt(0).toUpperCase() || 'U'}
      </div>
    )
  );

  return (
    <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Customer Reviews</h2>

      {reviewsLoading ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      ) : reviewsError ? (
        <p className="text-center text-destructive">{reviewsError}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Submission Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-foreground mb-4">Write a Review</h3>
              {authLoading ? (
                <p className="text-muted-foreground">Loading user data...</p>
              ) : user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${star <= newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          onClick={() => setNewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">Your Comment</label>
                    <textarea
                      id="comment"
                      rows="4"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Share your thoughts on this product..."
                      required
                    ></textarea>
                  </div>
                  {reviewFormError && <p className="text-destructive text-sm">{reviewFormError}</p>}
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-sky-700 transition disabled:bg-primary/60 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="text-muted-foreground">Please <Link to="/login" className="text-primary hover:underline">log in</Link> to write a review.</p>
              )}
            </div>
          </div>

          {/* Display Existing Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0"> {/* Adjusted for mobile */}
                    <div className="flex items-center gap-3">
                      {renderAvatar(review.userPhotoURL, review.userName)}
                      <div>
                        <p className="font-semibold text-foreground">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-foreground text-sm mb-4">{review.comment}</p>

                  {/* Like/Dislike Buttons (UI Only) */}
                  <div className="flex items-center gap-4 text-muted-foreground text-sm mt-4">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors p-2 rounded-md hover:bg-secondary"> {/* Added padding and hover */}
                      <ThumbsUp className="w-4 h-4" />
                      <span>0</span> {/* Placeholder for likes */}
                    </button>
                    <button className="flex items-center gap-1 hover:text-destructive transition-colors p-2 rounded-md hover:bg-secondary"> {/* Added padding and hover */}
                      <ThumbsDown className="w-4 h-4" />
                      <span>0</span> {/* Placeholder for dislikes */}
                    </button>
                    {user && (
                      <button className="ml-auto text-primary hover:underline p-2 rounded-md hover:bg-secondary">Reply</button> 
                    )}
                  </div>

                  {/* Replies Section */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <p className="text-sm font-semibold text-foreground">Replies:</p>
                      {review.replies.map((reply, index) => (
                        <div key={index} className="flex items-start gap-3 bg-background/50 p-3 rounded-lg">
                          {renderAvatar(reply.userPhotoURL, reply.userName)}
                          <div>
                            <p className="text-sm font-semibold text-foreground">{reply.userName}</p>
                            <p className="text-xs text-muted-foreground mb-1">{new Date(reply.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-foreground">{reply.replyText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {user && (
                    <form onSubmit={(e) => handleReplySubmit(review._id, e)} className="mt-4 pt-4 border-t border-border">
                      <label htmlFor={`reply-${review._id}`} className="sr-only">Reply to {review.userName}</label>
                      <textarea
                        id={`reply-${review._id}`}
                        rows="2"
                        value={replyText[review._id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [review._id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Write a reply..."
                        required
                      ></textarea>
                      {replyFormError[review._id] && <p className="text-destructive text-sm mt-1">{replyFormError[review._id]}</p>}
                      <button
                        type="submit"
                        disabled={isSubmittingReply[review._id]}
                        className="mt-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-muted transition disabled:bg-muted/60 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReply[review._id] ? 'Replying...' : 'Reply'}
                      </button>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewSection;