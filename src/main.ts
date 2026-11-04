import 'modern-normalize/modern-normalize.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-400-italic.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import { initDailyQuotes } from './components/daily-quote/daily-quote';
import { initAppShell } from './components/app-shell/app-shell';
import { initSearchFields } from './components/search-field/search-field';
import './pages/home-page/home-page';
import './pages/favorites-page/favorites-page';

initAppShell();
initSearchFields();

initDailyQuotes();
