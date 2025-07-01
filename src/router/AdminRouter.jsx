import { Navigate, Route, Routes } from "react-router-dom";
import StudentControl from "../pages/admin/StudentControl";
import CourseControl from "../pages/admin/CourseControl";
import TeacherControl from "../pages/admin/TeacherControl";

function AdminHome(){
    return(
        <div>
            <h2>Bienvenido al panel de control de Aadministrador</h2>
        </div>
    )
}

function AdminRouter(){
    return(
        <Routes>
            <Route index element={<AdminHome/>}/>
            <Route path="students" element={<StudentControl/>}/>
            <Route path="teachers" element={<TeacherControl/>}/>
            <Route path="courses" element={<CourseControl/>}/>
            <Route path="*" element={<Navigate to="/admin" replace/>}/>
        </Routes>
    )
}

export default AdminRouter;