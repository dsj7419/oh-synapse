// src/components/admin/playground/preview/BadgePreview.tsx

import { Badge } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

interface BadgePreviewProps {
  theme: Theme;
}

export const BadgePreview = ({ theme }: BadgePreviewProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Badge Preview</h3>
      <Badge
        style={{
          backgroundColor: theme.primaryColor,
          fontSize: theme.scaling,
        }}
      >
        Example Badge
      </Badge>
    </div>
  );
};
