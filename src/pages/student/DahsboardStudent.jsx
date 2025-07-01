
import { useAuth } from "../../contexts/AuthContext";

function DashboardAdmin(){
    const {user,logout}=useAuth();
    return (
        <div>
            <h1>Dashboard de Alumnos</h1>
            
            {user?(
                <p>Hola {user.email}! Rol: {user.roles}</p>
            ):(
                <p>Cargando informacion</p>
            )}
            <br />
            <button onClick={logout}>Cerrar Sesion</button>
        </div>
    );
}


export default DashboardAdmin