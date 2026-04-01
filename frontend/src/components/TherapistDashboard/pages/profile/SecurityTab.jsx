import React from "react";
import ToggleSwitch from "./ToggleSwitch";
import Input from "../../../common/forms/Input";

const SecurityTab = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">Security Settings</h3>
    <Input
      label="New Password"
      type="password"
      placeholder="Enter new password"
    />
    <Input
      label="Confirm Password"
      type="password"
      placeholder="Confirm new password"
    />
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        Two-Factor Authentication
      </span>
      <ToggleSwitch />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">Account Privacy</span>
      <ToggleSwitch />
    </div>
  </div>
);

export default SecurityTab;
