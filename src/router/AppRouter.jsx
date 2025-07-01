import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import DashboardTeacher from '../pages/teacher/DahsboardTeacher';
import DashboardStudent from '../pages/student/DahsboardStudent';
import AdminRouter from './AdminRouter';


function AppRouter(){
    const {isAuthenticated,user,loading}= useAuth();

    if(loading){
        return <div>Cargando rutas...</div>
    }
    const getDashboardPath = (user) => {
            if (!user || !user.roles) return '/dashboard';
            if (user.roles.includes('ROLE_ADMIN')) {
                return '/admin';
            } else if (user.roles.includes('ROLE_DOCENTE')) {
                return '/teacher';
            } else if (user.roles.includes('ROLE_ALUMNO')) {
                return '/student';
            }
            return '/dashboard';
        };
    return(
        <Routes>
            <Route path='/'
            element={isAuthenticated?
                (<Navigate to ={getDashboardPath(user)}/>)
                :
                (<Navigate to="/login" replace/>)
                }
            />

            <Route path='/login'
            element={isAuthenticated?
                (<Navigate to ={getDashboardPath(user)}/>)
                :
                (<LoginPage/>)
                }
            />

            //RUTAS DE ADMIN
            <Route path='/admin/*' element={isAuthenticated &&user &&user.roles.includes('ROLE_ADMIN')? 
                (<DashboardAdmin/>) : 
                (<Navigate to='/login' replace/>)}
            >    
                <Route path='*' element={<AdminRouter/>}/>
            </Route>


            <Route path='/teacher/*' element={isAuthenticated &&user &&user.roles.includes('ROLE_DOCENTE')? 
                (<DashboardTeacher/>) : 
                (<Navigate to='/login' replace/>)}
            />
            <Route path='/student/*' element={isAuthenticated &&user &&user.roles.includes('ROLE_ALUMNO')? 
                (<DashboardStudent/>) : 
                (<Navigate to='/login' replace/>)}
            />




            <Route path="*" element={<NotFoundPage/>}></Route>
        </Routes>
    )
}
export default AppRouter;