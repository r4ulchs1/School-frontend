import { useEffect, useState } from "react";
import userService from "../../services/admin/userService";

function StudentControl (){

    const [students,setStudents]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);
    const [selectedStudent,setSelectedStudent]=useState(null);
    const [isEditing,setIsEditing]=useState(false);
    const [formValues,setFormValues]=useState({
        nombre:'',
        apellido:'',
        email:'',
        telefono:'',
        password:'',
        rol:'ALUMNO'
    })

    useEffect(()=>{
        loadStudents();
    },[]);


    const loadStudents= async()=>{
        setLoading(true);
        setError(null);
        try {
            const allUsers= await userService.getAllUsers();
            const students=allUsers.filter(user=>user.rol==='ALUMNO');
            setStudents(students);
        } catch (err) {
            setError('Error al cargar alumnos');
            console.error(err);
        }finally{
            setLoading(false);
        }
    }
    return(
        <div>
            <h2>Lista</h2>
            <h4>{students.map(student=>(
                <h2>{student.nombre}</h2>
            ))}</h4>
        </div>
    )
}

export default StudentControl;