import { Navigate, Route, Routes } from "react-router-dom";
import CourseTeacher from "../pages/teacher/CourseTeacher";
import ForoPage from "../pages/foro/ForoPage";
import TaskTeacher from "../pages/teacher/TaskTeacher";

function TeacherHome(){
    return(
        <div>
            <h2>Bienvenido al panel de control de docentes</h2>
        </div>
    )
}

function TeacherRouter(){
    return(
        <Routes>
            <Route index element={<TeacherHome/>}/>
            <Route path="courses" element={<CourseTeacher/>}/>
            <Route path="foro" element={<ForoPage/>}/>
            <Route path="task" element={<TaskTeacher/>}/>
            <Route path="*" element={<Navigate to="/teacher" replace/>}/>
        </Routes>
    )
}

export default TeacherRouter;