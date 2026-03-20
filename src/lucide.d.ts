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
  export const Monitor: Icon;
  export const Wallet: Icon;
  export const RefreshCw: Icon;
  export const AlertCircle: Icon;
  export const TrendingUp: Icon;
  export const DollarSign: Icon;
  export const PieChart: Icon;
}
