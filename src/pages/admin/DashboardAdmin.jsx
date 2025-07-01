import { useAuth } from "../../contexts/AuthContext";
import { Link,Outlet } from "react-router-dom";

function DashboardAdmin(){
    const {user,logout}=useAuth();
    return (
        <div>
            <nav>
                <h2>Barra de navegacion</h2>
                <div>
                    <Link to='/admin'>Inicio</Link>
                    <Link to='/admin/students'>Alumnos</Link>
                    <Link to='/admin/teachers'>Docentes</Link>
                    <Link to='/admin/courses'>Cursos</Link>
                </div>
                <span>Hola, {user.email}</span>
                <button onClick={logout}>Cerrar sesion</button>
            </nav>
            <div>
                <Outlet/>
            </div>
        </div>
    );
}


export default DashboardAdmin