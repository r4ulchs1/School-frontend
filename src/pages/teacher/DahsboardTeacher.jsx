
import { useAuth } from "../../contexts/AuthContext";
import { Link,Outlet } from "react-router-dom";

function DashboardAdmin(){
    const {user,logout}=useAuth();
    return (
        <div>
            <nav>
                <h2>Barra de navegacion</h2>
                <div>
                    <Link to='/teacher'>Inicio</Link>
                    <Link to='/teacher/courses'>Cursos</Link>
                    <Link to='/teacher/foro'>Foro</Link>
                    <Link to='/teacher/task'>Tareas</Link>
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