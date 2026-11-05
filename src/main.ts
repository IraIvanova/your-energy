import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-sans/400-italic.css';
import 'modern-normalize/modern-normalize.css';
import './styles/index.css';
import { initAppShell } from './components/app-shell/app-shell';
import { initSearchFields } from './components/search-field/search-field';
import './pages/home-page/home-page';
import './pages/favorites-page/favorites-page';
import './components/footer/footer';

initAppShell();
initSearchFields();
