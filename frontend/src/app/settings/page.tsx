"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Shield,
  Key,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Check,
  MapPin,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { authService } from "@/services/authService";
import { addressService, AddressPayload } from "@/services/addressService";
import { Address } from "@/types";
import { toApiError } from "@/lib/api";
import { PhoneInputField } from "@/components/ui/PhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js";

export default function SettingsPage() {
  const { user, loading, logoutLocal } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password1: "",
    new_password2: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<
    Record<string, string[]>
  >({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressPayload>({
    address_type: "SHIPPING",
    first_name: "",
    last_name: "",
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    is_default: false,
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSubmitting(true);
    setAddressError(null);

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressFormData);
      } else {
        await addressService.createAddress(addressFormData);
      }
      await fetchAddresses();
      setShowAddressModal(false);
      resetAddressForm();
    } catch (err: any) {
      setAddressError(err?.detail || "Failed to save address. Please check your inputs.");
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  const handleSetDefaultAddress = async (address: Address) => {
    try {
      await addressService.updateAddress(address.id, { is_default: true });
      await fetchAddresses();
    } catch (err) {
      console.error("Failed to set default address:", err);
    }
  };

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        address_type: address.address_type,
        first_name: address.first_name,
        last_name: address.last_name,
        street_address: address.street_address,
        city: address.city,
        state_province: address.state_province,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      resetAddressForm();
    }
    setAddressError(null);
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_type: "SHIPPING",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      street_address: "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
      is_default: false,
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Accessing Protocols...
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(null);

    if (
      profileData.phone_number &&
      !isValidPhoneNumber(profileData.phone_number)
    ) {
      setErrors({ phone_number: ["Please enter a valid phone number"] });
      setSaving(false);
      return;
    }

    try {
      await authService.updateProfile(profileData);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        setErrors(toApiError(err) as Record<string, string[]>);
      } else {
        setErrors({ non_field_errors: ["An unexpected error occurred."] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    if (passwordData.new_password1 !== passwordData.new_password2) {
      setPasswordErrors({ new_password2: ["Passwords do not match"] });
      setPasswordLoading(false);
      return;
    }

    try {
      await authService.changePassword(passwordData);
      setPasswordSuccess(true);
      setPasswordData({
        old_password: "",
        new_password1: "",
        new_password2: "",
      });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        setPasswordErrors(toApiError(err) as Record<string, string[]>);
      } else {
        setPasswordErrors({
          non_field_errors: ["An unexpected error occurred."],
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await authService.deleteAccount();
      logoutLocal("/auth/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "detail" in err) {
        setDeleteError((err as { detail: string }).detail);
      } else {
        setDeleteError("An unexpected error occurred.");
      }
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">
            Settings
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">
            Manage your account, security, and preferences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl border-white/5 overflow-hidden"
        >
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Profile</h2>
                <p className="text-sm text-zinc-500">
                  Your personal information
                </p>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs mb-6">
                <Check className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-colors"
                  />
                  {errors.first_name && (
                    <p className="text-[10px] text-red-400 mt-1">
                      {errors.first_name[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-colors"
                  />
                  {errors.last_name && (
                    <p className="text-[10px] text-red-400 mt-1">
                      {errors.last_name[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Phone Number
                </label>
                <PhoneInputField
                  value={profileData.phone_number}
                  onChange={(value) =>
                    setProfileData({ ...profileData, phone_number: value })
                  }
                  error={errors.phone_number}
                  placeholder="Phone Number"
                />
              </div>

              {errors.non_field_errors && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {Array.isArray(errors.non_field_errors)
                    ? errors.non_field_errors[0]
                    : errors.non_field_errors}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-xl">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Password</h2>
                <p className="text-sm text-zinc-500">
                  Change your account password
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordErrors({});
                setPasswordSuccess(false);
                setPasswordData({
                  old_password: "",
                  new_password1: "",
                  new_password2: "",
                });
              }}
              className="px-6 py-3 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Change Password
            </button>
          </div>

          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Addresses</h2>
                  <p className="text-sm text-zinc-500">
                    Your shipping and billing addresses
                  </p>
                </div>
              </div>
              <button
                onClick={() => openAddressModal()}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Address
              </button>
            </div>

            {addressesLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                <MapPin className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 text-sm font-medium">No addresses saved yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      addr.is_default 
                        ? "bg-indigo-500/5 border-indigo-500/20" 
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {addr.address_type}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openAddressModal(addr)}
                          className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      {addr.first_name} {addr.last_name}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {addr.street_address}, {addr.city}<br />
                      {addr.state_province} {addr.postal_code}, {addr.country}
                    </p>
                    {!addr.is_default && (
                      <button 
                        onClick={() => handleSetDefaultAddress(addr)}
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    {addr.is_default && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default Address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
                <p className="text-sm text-zinc-500">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
              <div>
                <div className="text-sm font-bold text-red-400">
                  Delete Account
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Permanently delete your account and all data
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirm("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass p-8 rounded-[2rem] max-w-md w-full border-white/10 relative"
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {passwordSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Password Updated
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Your password has been changed successfully.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Change Password
                  </h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    Enter your current password and a new one.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                        Current Password
                      </label>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            old_password: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none focus:border-white/20 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-4 top-[38px] text-zinc-500 hover:text-white transition-colors"
                      >
                        {showOldPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new_password1}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password1: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none focus:border-white/20 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-[38px] text-zinc-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {passwordErrors.new_password1 && (
                        <p className="text-[10px] text-red-400 mt-1">
                          {passwordErrors.new_password1[0]}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                        Confirm New Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.new_password2}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password2: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white outline-none focus:border-white/20 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-[38px] text-zinc-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      {passwordErrors.new_password2 && (
                        <p className="text-[10px] text-red-400 mt-1">
                          {passwordErrors.new_password2[0]}
                        </p>
                      )}
                    </div>

                    {passwordErrors.old_password && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {Array.isArray(passwordErrors.old_password)
                          ? passwordErrors.old_password[0]
                          : passwordErrors.old_password}
                      </div>
                    )}

                    {passwordErrors.non_field_errors && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {Array.isArray(passwordErrors.non_field_errors)
                          ? passwordErrors.non_field_errors[0]
                          : passwordErrors.non_field_errors}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass p-8 rounded-[2rem] max-w-md w-full border-white/10 relative"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2 text-center">
                Delete Account
              </h2>
              <p className="text-sm text-zinc-500 mb-6 text-center">
                This action is permanent and cannot be undone. All your data,
                orders, and profile information will be erased.
              </p>

              <div className="mb-6">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500/50 transition-colors"
                  placeholder="DELETE"
                />
              </div>

              {deleteError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] mb-6">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {deleteError}
                </div>
              )}

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass p-8 rounded-[2rem] max-w-lg w-full border-white/10 relative"
            >
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-2">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Enter your address details below.
              </p>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Type</label>
                    <select
                      value={addressFormData.address_type}
                      onChange={(e) => setAddressFormData({...addressFormData, address_type: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="SHIPPING" className="bg-zinc-900">Shipping</option>
                      <option value="BILLING" className="bg-zinc-900">Billing</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2.5">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={addressFormData.is_default}
                        onChange={(e) => setAddressFormData({...addressFormData, is_default: e.target.checked})}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-offset-0 focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">Set as Default</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">First Name</label>
                    <input
                      type="text"
                      value={addressFormData.first_name}
                      onChange={(e) => setAddressFormData({...addressFormData, first_name: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Last Name</label>
                    <input
                      type="text"
                      value={addressFormData.last_name}
                      onChange={(e) => setAddressFormData({...addressFormData, last_name: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Street Address</label>
                  <input
                    type="text"
                    value={addressFormData.street_address}
                    onChange={(e) => setAddressFormData({...addressFormData, street_address: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">City</label>
                    <input
                      type="text"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Postal Code</label>
                    <input
                      type="text"
                      value={addressFormData.postal_code}
                      onChange={(e) => setAddressFormData({...addressFormData, postal_code: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">State / Province</label>
                    <input
                      type="text"
                      value={addressFormData.state_province}
                      onChange={(e) => setAddressFormData({...addressFormData, state_province: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Country</label>
                    <input
                      type="text"
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {addressError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {addressError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addressSubmitting}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4"
                >
                  {addressSubmitting ? "Saving..." : (editingAddress ? "Update Address" : "Save Address")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
