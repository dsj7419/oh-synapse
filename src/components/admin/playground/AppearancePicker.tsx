// src/components/admin/playground/AppearancePicker.tsx

import { useState } from 'react';

interface AppearancePickerProps {
  theme: { appearance: 'light' | 'dark' };
  onAppearanceChange: (appearance: 'light' | 'dark') => void;
}

const AppearancePicker = ({ theme, onAppearanceChange }: AppearancePickerProps) => {
  const [selectedAppearance, setSelectedAppearance] = useState(theme.appearance);

  const handleAppearanceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAppearance = event.target.value as 'light' | 'dark';
    setSelectedAppearance(newAppearance);
    onAppearanceChange(newAppearance);
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Appearance</h3>
      <select
        value={selectedAppearance}
        onChange={handleAppearanceChange}
        className="w-full h-10 rounded-md border"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};

export default AppearancePicker;
