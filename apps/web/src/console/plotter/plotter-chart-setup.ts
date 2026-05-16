import {
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { RealTimeScale, StreamingPlugin } from '@aziham/chartjs-plugin-streaming';

Chart.register(
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  RealTimeScale,
  StreamingPlugin,
  Tooltip,
);