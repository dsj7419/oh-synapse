// src/components/admin/playground/LayoutPicker.tsx

interface LayoutPickerProps {
  theme: { layout: string };
  onLayoutChange: (layout: string) => void;
}

const LayoutPicker = ({ theme, onLayoutChange }: LayoutPickerProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Layout</h3>
      <select
        value={theme.layout}
        onChange={(e) => onLayoutChange(e.target.value)}
        className="w-full h-10 rounded-md border"
      >
        <option value="Grid">Grid</option>
        <option value="List">List</option>
      </select>
    </div>
  );
};

export default LayoutPicker;
