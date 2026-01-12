import Ajustes from './pages/Ajustes';
import Consultas from './pages/Consultas';
import Contactos from './pages/Contactos';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Hoy from './pages/Hoy';
import Pipeline from './pages/Pipeline';
import Plantillas from './pages/Plantillas';
import Reportes from './pages/Reportes';
import Variables from './pages/Variables';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Ajustes": Ajustes,
    "Consultas": Consultas,
    "Contactos": Contactos,
    "Dashboard": Dashboard,
    "Home": Home,
    "Hoy": Hoy,
    "Pipeline": Pipeline,
    "Plantillas": Plantillas,
    "Reportes": Reportes,
    "Variables": Variables,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};