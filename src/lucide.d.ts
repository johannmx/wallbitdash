import { FC, SVGProps } from 'react';

declare module 'lucide-react' {
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;
  export const Sun: Icon;
  export const Moon: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Wallet: Icon;
  export const RefreshCw: Icon;
  export const AlertCircle: Icon;
  export const DollarSign: Icon;
  export const PieChart: Icon;
}
