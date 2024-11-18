import 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    zoom?: {
      pan?: { enabled: boolean; mode: string };
      zoom?: {
        wheel?: { enabled: boolean };
        pinch?: { enabled: boolean };
        mode: string;
      };
    };
  }
}
