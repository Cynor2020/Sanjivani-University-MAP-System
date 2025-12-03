import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function AdPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenAd, setHasSeenAd] = useState(false);

  // Fetch active advertisement
  const { data: adData } = useQuery({
    queryKey: ["activeAdvertisement"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements/active`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Check if there's an active ad and user hasn't seen it in this session
    if (adData?.advertisement && !hasSeenAd) {
      // Small delay before showing the popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [adData, hasSeenAd]);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenAd(true);
  };

  const handleCtaClick = () => {
    if (adData?.advertisement?.ctaButtonUrl) {
      window.open(adData.advertisement.ctaButtonUrl, '_blank');
    }
    handleClose();
  };

  if (!adData?.advertisement) {
    return null;
  }

  const ad = adData.advertisement;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Banner Image */}
        <div className="relative">
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/600x300?text=Advertisement";
            }}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{ad.title}</h2>
          <p className="text-gray-700 leading-relaxed">{ad.description}</p>

          {/* CTA Button */}
          <Button
            onClick={handleCtaClick}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {ad.ctaButtonText}
          </Button>

          {/* Meta Info */}
          <div className="pt-2 text-xs text-gray-500 text-center">
            Valid until {new Date(ad.endDate).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
