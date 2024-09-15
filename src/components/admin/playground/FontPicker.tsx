// src/components/admin/playground/FontPicker.tsx

interface FontPickerProps {
  theme: { font: string };
  onFontChange: (font: string) => void;
}

const FontPicker = ({ theme, onFontChange }: FontPickerProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Font</h3>
      <select
        value={theme.font}
        onChange={(e) => onFontChange(e.target.value)}
        className="w-full h-10 rounded-md border"
      >
        <option value="Arial">Arial</option>
        <option value="Roboto">Roboto</option>
        <option value="Times New Roman">Times New Roman</option>
      </select>
    </div>
  );
};

export default FontPicker;
