import 'modern-normalize/modern-normalize.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-400-italic.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import { initAppShell } from './components/AppShell/AppShell';
import { initSearchFields } from './components/SearchField/SearchField';
import './pages/HomePage/HomePage';
import './pages/FavoritesPage/FavoritesPage';

initAppShell();
initSearchFields();
