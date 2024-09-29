import { Badge, Flex } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

interface BadgePreviewProps {
  theme: Theme;
}

const badgeVariants: Array<'solid' | 'soft' | 'surface' | 'outline'> = ["solid", "soft", "surface", "outline"];
const badgeColors = ["", "gray"]; // Empty string for default (Accent) color

export const BadgePreview = ({ theme }: BadgePreviewProps) => {
  const renderBadges = () => {
    return badgeVariants.map((variant) => (
      <tr key={variant} className="border-t border-gray-200">
        <td
          className="py-1 px-2 font-medium"
          style={{ color: 'var(--color-text)' }} // Dynamically set text color using theme variable
        >
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </td>
        {badgeColors.map((color) => (
          <td key={color} className="py-1 px-2">
            <Flex gap="2" align="center">
              {/* Regular Badge */}
              <Badge
                variant={variant}
                data-accent-color={color} // Accent or gray color
                className="rt-reset rt-Badge rt-r-size-1"
              >
                New
              </Badge>
              {/* High Contrast Badge */}
              <Badge
                variant={variant}
                data-accent-color={color} // Accent or gray color
                className="rt-reset rt-Badge rt-r-size-1 rt-high-contrast"
              >
                New
              </Badge>
            </Flex>
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="badge-preview">
      {/* Header Section */}
      <div className="flex items-baseline">
        <h1 className="text-2xl font-semibold">Badge</h1>
      </div>

      {/* Badge Preview Table */}
      <div className="mt-4"> {/* Removed centering logic */}
        <table className="w-auto text-left table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-1 px-2"></th>
              <th className="py-1 px-2">Accent</th>
              <th className="py-1 px-2">Gray</th>
            </tr>
          </thead>
          <tbody>{renderBadges()}</tbody>
        </table>
      </div>
    </div>
  );
};
