interface ThemeSelectorProps {
  theme: { name: string };
  onThemeChange: (name: string) => void;
}

export default function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  return (
    <select value={theme.name} onChange={(e) => onThemeChange(e.target.value)}>
      <option value="Light">Light</option>
      <option value="Dark">Dark</option>
    </select>
  );
}
