import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaTrash } from "react-icons/fa";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";
import api from "../../../../utils/api";
import toast from "react-hot-toast";

const SecurityTab = ({ patient, reloadPatient }) => {
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    try {
      setBusy(true);
      await api.post("/patient/change-password", {
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not change password";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!patient?._id) return;
    const next = !patient.twoFactorEnabled;
    try {
      setBusy(true);
      const { data } = await api.post("/patient/security/two-factor", {
        enabled: next,
      });
      toast.success(data?.message || "Security preference saved");
      if (typeof reloadPatient === "function") {
        await reloadPatient();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not update two-factor setting";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Enter your password to confirm account deletion");
      return;
    }
    const sure = window.confirm(
      "Delete your account permanently? This cannot be undone."
    );
    if (!sure) return;
    try {
      setBusy(true);
      await api.delete("/patient/account", { data: { password: deletePassword } });
      localStorage.removeItem("user");
      toast.success("Account deleted");
      navigate("/welcome");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not delete account";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const twoFactorOn = Boolean(patient?.twoFactorEnabled);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaLock className="mr-2" /> Change Password
        </h3>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Current Password"
            labelText="Current Password"
            id="currentPassword"
            name="currentPassword"
            value={passwordForm.currentPassword}
            handleChange={handlePasswordChange}
          />
          <Input
            type="password"
            placeholder="New Password"
            labelText="New Password"
            id="newPassword"
            name="newPassword"
            value={passwordForm.newPassword}
            handleChange={handlePasswordChange}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            labelText="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            handleChange={handlePasswordChange}
          />
          <Button
            label="Change Password"
            onClick={handleChangePassword}
            disabled={busy}
            icon={<FaLock className="mr-2" />}
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaLock className="mr-2" /> Two-Factor Authentication
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Turn on a security flag on your account. Full SMS/app verification is
          not configured yet; this preference is saved for when your team adds
          OTP.
        </p>
        <Button
          label={
            twoFactorOn
              ? "Disable Two-Factor Authentication"
              : "Enable Two-Factor Authentication"
          }
          onClick={handleToggleTwoFactor}
          disabled={busy}
          icon={<FaLock className="mr-2" />}
          color="green-600"
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
          <FaTrash className="mr-2" /> Delete Account
        </h3>
        <p className="text-gray-600 mb-4">
          Warning: This action is irreversible. All your data will be
          permanently deleted.
        </p>
        <div className="space-y-4 max-w-md">
          <Input
            type="password"
            placeholder="Your password to confirm"
            labelText="Confirm with password"
            id="deletePassword"
            name="deletePassword"
            value={deletePassword}
            handleChange={(e) => setDeletePassword(e.target.value)}
          />
          <Button
            label="Delete Account"
            onClick={handleDeleteAccount}
            disabled={busy}
            icon={<FaTrash className="mr-2" />}
            color="red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
