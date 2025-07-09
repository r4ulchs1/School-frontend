
import { useAuth } from "../../contexts/AuthContext";
import { Link,Outlet } from "react-router-dom";

function DashboardAdmin(){
    const {user,logout}=useAuth();
    return (
        <div>
            <nav>
                <h2>Barra de navegacion</h2>
                <div>
                    <Link to='/student'>Inicio</Link>
                    <Link to='/student/courses'>Cursos</Link>
                    <Link to='/student/foro'>Foro</Link>
                    <Link to='/student/notas'>Notas</Link>
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