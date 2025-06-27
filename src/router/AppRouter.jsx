import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';



function HomePage(){
    return(
        <div>
            <h1>Bienvenido a la plataforma</h1>
            <p>Por favor, <a href="/login">Inicia Sesion</a> para continuar</p>
        </div>
    )
}

function AppRouter(){
    const isAuthenticated=false;

    return(
        <Routes>
            <Route path='/' element={isAuthenticated? <HomePage/> : <Navigate to="/login" />}></Route>
            <Route path='/login' element={<LoginPage/>}></Route>

            <Route path="/dashboard" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}></Route>
            <Route path="*" element={<NotFoundPage/>}></Route>
        </Routes>
    )
}
export default AppRouter;