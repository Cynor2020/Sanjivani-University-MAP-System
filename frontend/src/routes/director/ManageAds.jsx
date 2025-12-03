import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Power, Eye } from "lucide-react";

export default function ManageAds() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerUrl: "",
    ctaButtonText: "Learn More",
    ctaButtonUrl: "",
    startDate: "",
    endDate: "",
  });

  // Fetch all advertisements
  const { data: adsData, isLoading } = useQuery({
    queryKey: ["advertisements"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch advertisements");
      return res.json();
    },
  });

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create advertisement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["advertisements"]);
      toast.success("Advertisement created successfully");
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update advertisement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["advertisements"]);
      toast.success("Advertisement updated successfully");
      setIsEditModalOpen(false);
      setSelectedAd(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to toggle status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["advertisements"]);
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advertisements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete advertisement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["advertisements"]);
      toast.success("Advertisement deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      bannerUrl: "",
      ctaButtonText: "Learn More",
      ctaButtonUrl: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleCreateAd = () => {
    if (!formData.title || !formData.description || !formData.bannerUrl || 
        !formData.ctaButtonText || !formData.ctaButtonUrl || 
        !formData.startDate || !formData.endDate) {
      toast.error("All fields are required");
      return;
    }
    createAdMutation.mutate(formData);
  };

  const handleEditAd = (ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      bannerUrl: ad.bannerUrl,
      ctaButtonText: ad.ctaButtonText,
      ctaButtonUrl: ad.ctaButtonUrl,
      startDate: new Date(ad.startDate).toISOString().split("T")[0],
      endDate: new Date(ad.endDate).toISOString().split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAd = () => {
    if (!formData.title || !formData.description || !formData.bannerUrl || 
        !formData.ctaButtonText || !formData.ctaButtonUrl || 
        !formData.startDate || !formData.endDate) {
      toast.error("All fields are required");
      return;
    }
    updateAdMutation.mutate({ id: selectedAd._id, data: formData });
  };

  const handleDeleteAd = (id) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      deleteAdMutation.mutate(id);
    }
  };

  const handlePreview = (ad) => {
    setPreviewAd(ad);
    setIsPreviewOpen(true);
  };

  const AdForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter advertisement title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter advertisement description"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Banner URL</label>
        <input
          type="url"
          value={formData.bannerUrl}
          onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/banner.jpg"
        />
        {formData.bannerUrl && (
          <img 
            src={formData.bannerUrl} 
            alt="Banner preview" 
            className="mt-2 w-full h-40 object-cover rounded-md"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">CTA Button Text</label>
          <input
            type="text"
            value={formData.ctaButtonText}
            onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Learn More"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CTA Button URL</label>
          <input
            type="url"
            value={formData.ctaButtonUrl}
            onChange={(e) => setFormData({ ...formData, ctaButtonUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Advertisements</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ad
        </Button>
      </div>

      {isLoading ? (
        <p>Loading advertisements...</p>
      ) : (
        <div className="grid gap-4">
          {adsData?.advertisements?.map((ad) => (
            <Card key={ad._id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={ad.bannerUrl}
                    alt={ad.title}
                    className="w-48 h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{ad.title}</h3>
                        <p className="text-gray-600 mt-1">{ad.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(ad)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatusMutation.mutate(ad._id)}
                        >
                          <Power className={`h-4 w-4 ${ad.isActive ? "text-green-600" : "text-gray-400"}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAd(ad)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAd(ad._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                      <span>Start: {new Date(ad.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(ad.endDate).toLocaleDateString()}</span>
                      <span className={`font-semibold ${ad.isActive ? "text-green-600" : "text-gray-400"}`}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {adsData?.advertisements?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No advertisements found. Create your first ad!
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advertisement</DialogTitle>
          </DialogHeader>
          <AdForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAd} disabled={createAdMutation.isPending}>
              {createAdMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Advertisement</DialogTitle>
          </DialogHeader>
          <AdForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAd} disabled={updateAdMutation.isPending}>
              {updateAdMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          {previewAd && (
            <div className="space-y-4">
              <img
                src={previewAd.bannerUrl}
                alt={previewAd.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-xl font-bold">{previewAd.title}</h3>
              <p className="text-gray-700">{previewAd.description}</p>
              <Button className="w-full" onClick={() => window.open(previewAd.ctaButtonUrl, '_blank')}>
                {previewAd.ctaButtonText}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
