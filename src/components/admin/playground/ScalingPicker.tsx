interface ScalingPickerProps {
  theme: { scaling: string };
  onScalingChange: (scaling: string) => void;
}

const ScalingPicker = ({ theme, onScalingChange }: ScalingPickerProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Scaling</h3>
      <select
        value={theme.scaling}
        onChange={(e) => onScalingChange(e.target.value)}
        className="w-full h-10 rounded-md border"
      >
        <option value="90%">90%</option>
        <option value="95%">95%</option>
        <option value="100%">100%</option>
        <option value="105%">105%</option>
        <option value="110%">110%</option>
      </select>
    </div>
  );
};

export default ScalingPicker;
