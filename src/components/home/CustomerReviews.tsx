import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Quote, Plus, Sparkles, X, MessageSquareHeart } from 'lucide-react';
import { Review } from '../../types';
import { getStoredReviews, saveStoredReviews } from '../../services/storeService';
import { INITIAL_REVIEWS } from '../../data/initialData';

interface CustomerReviewsProps {
  reviews?: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'date' | 'verifiedBuyer'>) => void;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews: externalReviews,
  onAddReview: externalAddReview,
}) => {
  const [internalReviews, setInternalReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [productName, setProductName] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const stored = await getStoredReviews();
        setInternalReviews(stored && stored.length > 0 ? stored : INITIAL_REVIEWS);
      } catch {
        setInternalReviews(INITIAL_REVIEWS);
      }
    };
    fetchReviews();
  }, []);

  const currentReviews = externalReviews && externalReviews.length > 0 ? externalReviews : internalReviews;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newReviewData = {
      authorName: authorName.trim(),
      city: city.trim() || 'Ouagadougou',
      rating,
      comment: comment.trim(),
      productName: productName.trim() || 'Chemise Aziz Fashion',
    };

    if (externalAddReview) {
      externalAddReview(newReviewData);
    } else {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        ...newReviewData,
        date: 'Aujourd’hui',
        verifiedBuyer: true,
      };
      const updated = [newReview, ...internalReviews];
      setInternalReviews(updated);
      await saveStoredReviews(updated);
    }

    setAuthorName('');
    setCity('');
    setComment('');
    setProductName('');
    setModalOpen(false);
  };

  return (
    <section className="py-20 bg-[#050B18] border-b border-[#C5A059]/20 text-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10192C] text-[#C5A059] text-xs font-bold uppercase tracking-widest border border-[#C5A059]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Avis & Témoignages</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F0] tracking-tight font-serif"
            >
              Ils portent Aziz Fashion
            </h2>
            <p className="text-sm sm:text-base text-[#F5F5F0]/70 max-w-xl">
              Découvrez les retours de nos clients séduits par la coupe, la noblesse du tissu et la rapidité du service.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C5A059] hover:bg-[#d8b56f] text-[#050B18] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#050B18]" />
            <span>Donner mon avis</span>
          </button>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(currentReviews || []).map((review) => (
            <div
              key={review.id}
              className="bg-[#0B1325] p-6 rounded-2xl border border-[#C5A059]/20 hover:border-[#C5A059]/50 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-[#C5A059] fill-[#C5A059]'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#C5A059]/40 group-hover:text-[#C5A059] transition-colors" />
                </div>

                {/* Review comment */}
                <p className="text-sm text-[#F5F5F0]/80 italic leading-relaxed">
                  « {review.comment} »
                </p>

                {review.productName && (
                  <div className="text-xs font-semibold text-[#C5A059]">
                    Modèle : {review.productName}
                  </div>
                )}
              </div>

              {/* Author info */}
              <div className="pt-5 mt-4 border-t border-[#C5A059]/15 flex items-center gap-3">
                {review.userPhoto ? (
                  <img
                    src={review.userPhoto}
                    alt={review.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#10192C] text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center font-bold text-xs uppercase">
                    {(review.authorName || 'AF').slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#F5F5F0]">{review.authorName}</span>
                    {review.verifiedBuyer && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Acheteur vérifié" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#F5F5F0]/50">{review.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#0B1325] text-[#F5F5F0] rounded-2xl shadow-2xl border border-[#C5A059]/30 overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#10192C] text-white p-5 flex items-center justify-between border-b border-[#C5A059]/20">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold font-serif text-lg text-white">Partager votre avis</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 mb-1">
                  Votre nom et prénom *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: Salif Diallo"
                  className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 mb-1">
                    Ville ou Pays
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Ouagadougou"
                    className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 mb-1">
                    Modèle porté
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Faso Élégance"
                    className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 mb-2">
                  Votre note
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-600 hover:text-[#C5A059] transition-colors"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-[#C5A059] fill-[#C5A059]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-[#C5A059]">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F5F0]/80 mb-1">
                  Votre commentaire *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Que pensez-vous du tissu, de la coupe et du service ?"
                  className="w-full p-3 bg-[#050B18] border border-[#C5A059]/30 rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-[#10192C] text-[#F5F5F0]/70 text-xs font-bold uppercase rounded-xl hover:bg-[#1A2644]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C5A059] text-[#050B18] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d8b56f] transition-colors font-sans"
                >
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
