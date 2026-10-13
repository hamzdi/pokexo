import './pokexo.css';
import './style.css';
import { mountApp } from './ui/app.ts';

const root = document.getElementById('app');
if (!root) throw new Error('#app not found');
mountApp(root);
