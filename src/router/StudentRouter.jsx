import { Navigate, Route, Routes } from "react-router-dom";
import CourseStudent from "../pages/student/CourseStudent";
import ForoPage from "../pages/foro/ForoPage";
import NotasStudent from "../pages/student/NotasStudent";
import CourseDetailPage from "../pages/student/CourseDetailPage";

function StudentHome(){
    return(
        <div>
            <h2>Bienvenido al panel de control de docentes</h2>
        </div>
    )
}

function StudentRouter(){
    return(
        <Routes>
            <Route index element={<StudentHome/>}/>
            <Route path="courses" element={<CourseStudent/>}/>
            <Route path="courses/:codigoCurso" element={<CourseDetailPage/>}/>
            <Route path="foro" element={<ForoPage/>}/>
            <Route path="notas" element={<NotasStudent/>}/>
            <Route path="*" element={<Navigate to="/student" replace/>}/>
        </Routes>
    )
}

export default StudentRouter;