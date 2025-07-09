import { useEffect, useState } from "react";
import userService from "../../services/admin/userService";

function TeacherControl (){

    const [teachers,setTeachers]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(null);
    const [selectedTeacher,setSelectedTeacher]=useState(null);
    const [isEditing,setIsEditing]=useState(false);
    const [formValues,setFormValues]=useState({
        nombre:'',
        apellido:'',
        email:'',
        telefono:'',
        password:'',
        rol:'DOCENTE'
    })

    useEffect(()=>{
        loadTeachers();
    },[]);


    const loadTeachers= async()=>{
        setLoading(true);
        setError(null);
        try {
            const allUsers= await userService.getAllUsers();
            const teachers=allUsers.filter(user=>user.rol==='DOCENTE');
            setTeachers(teachers);
        } catch (err) {
            setError('Error al cargar docentes');
            console.error(err);
        }finally{
            setLoading(false);
        }
    }

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormValues({...formValues,[name]:value});
    }

    const handleSubmit =async (e)=>{
        e.preventDefault();
        setError(null);
        const dataToSend={...formValues,rol:'DOCENTE'};
        
        if (isEditing && dataToSend.password === '') {
            delete dataToSend.password;
        }
        try {
            if (isEditing) {
                await userService.updateUser(selectedTeacher.id,dataToSend);
                console.log('Docente Actualizado');
            }else{
                await userService.createUser(dataToSend);
                console.log('Docente Creado');
            }
            await loadTeachers();
            //resetForm();
        } catch (err) {
           console.error('Error al guardar: ',err); 
           setError(err.response?.data?.message||'Error al guardar');
        }
    }

    const handleEdit= (teacher)=>{
        setSelectedTeacher(teacher);
        setFormValues({
            nombre:teacher.nombre,
            apellido:teacher.apellido,
            email:teacher.email,
            telefono:teacher.telefono,
            password:'',
            rol:'DOCENTE'
        })
        setIsEditing(true);
    }

    const handleDelete=async (id)=>{
        if (window.confirm('Seguro?')){
            setError(null);
            try {
                await userService.deleteUser(id);
                console.log('usuario eliminado: ',id);
                await loadTeachers();
            } catch (err) {
                console.error('Error al eliminar: ',err);
                setError(err.response?.data?.message||'Error al eliminar');
            }
        }
    }

    const resetForm=()=>{
        setSelectedTeacher(null);
        setIsEditing(false);
        setFormValues({
            nombre:'',
            apellido:'',
            email:'',
            telefono:'',
            password:'',
            rol:'DOCENTE'
        })
    }
    if(loading){
        return <div>Cargando...</div>;
    }
    return(
        <div>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <h4>{isEditing? 'Editar Docente':'Crear Docente'}</h4>
                <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" name="nombre" value={formValues.nombre} onChange={handleChange} required/>

                    <label htmlFor="apellido">Apellido</label>
                    <input type="text" name="apellido" value={formValues.apellido} onChange={handleChange} required/>

                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" value={formValues.email} onChange={handleChange} required/>

                    <label htmlFor="telefono">Telefono</label>
                    <input type="text" name="telefono" value={formValues.telefono} onChange={handleChange} required/>

                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" value={formValues.password} onChange={handleChange} required={!isEditing}/>

                    <input type="hidden" name="rol" value={'DOCENTE'}/>
                </div>
                <button type="submit">{isEditing? 'Actualizar Docente':'Registrar Docente'}</button>
                <button type="button" onClick={resetForm}>Cancelar</button>
            </form>
            <h4>Lista de Docentes</h4>
            {teachers.length === 0 && !loading && <p>No hay docentes registrados.</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map(teacher => (
                        <tr key={teacher.id}>
                            <td>{teacher.id}</td>
                            <td>{teacher.nombre} {teacher.apellido}</td>
                            <td>{teacher.email}</td>
                            <td>{teacher.telefono}</td>
                            <td>
                                <button onClick={() => handleEdit(teacher)}>Editar</button>
                                <button onClick={() => handleDelete(teacher.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TeacherControl;