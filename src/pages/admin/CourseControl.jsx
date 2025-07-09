import React, { useState, useEffect } from 'react';
import courseService from "../../services/admin/courseService";
import userService from "../../services/admin/userService";
import foroService from '../../services/foro/foroService';

function CourseControl() {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formValues, setFormValues] = useState({
        nombre: '',
        descripcion: '',
        codigoCurso: '',
        docenteId: '',
    });

    useEffect(() => {
        loadCoursesAndTeachers();
    }, []);

    const loadCoursesAndTeachers = async () => {
        setLoading(true);
        setError(null);
        try {
            const coursesData = await courseService.getAllCourses();
            setCourses(coursesData);

            const allUsers = await userService.getAllUsers();
            const teachersOnly = allUsers.filter(user => user.rol === 'DOCENTE');
            setTeachers(teachersOnly);
        } catch (err) {
            setError('Error al cargar cursos o docentes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const dataToSend = {
            ...formValues,
            docenteId: formValues.docenteId ? parseInt(formValues.docenteId, 10) : null,
        };
        
        try {
            let cursoGuardado;
            if (isEditing) {
                cursoGuardado = await courseService.updateCourse(selectedCourse.id, dataToSend);
                console.log('Curso Actualizado:', cursoGuardado);
            } else {
                cursoGuardado = await courseService.createCourse(dataToSend);
                console.log('Curso Creado:', cursoGuardado);

                // --- Lógica para crear el foro automáticamente ---
                if (cursoGuardado && cursoGuardado.id) {
                    const nuevoForoData = {
                        titulo: `Foro del Curso: ${cursoGuardado.nombre}`,
                        descripcion: `Espacio de discusión para el curso ${cursoGuardado.nombre}.`,
                        cursoId: cursoGuardado.id
                    };
                    try {
                        const foroCreado = await foroService.crearForo(nuevoForoData);
                        console.log('Foro creado automáticamente para el curso:', foroCreado);
                    } catch (foroErr) {
                        console.warn('Advertencia: No se pudo crear el foro automáticamente (podría ya existir o haber un error):', foroErr);
                    }
                }
            }
            await loadCoursesAndTeachers();
            resetForm();
        } catch (err) {
            console.error('Error al guardar curso: ', err);
            setError(err.response?.data?.message || 'Error al guardar curso');
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setIsEditing(true);
        setFormValues({
            nombre: course.nombre,
            descripcion: course.descripcion,
            codigoCurso: course.codigoCurso,
            docenteId: course.docente ? course.docente.id : '', 
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esto también eliminará su foro, lecciones y tareas/recursos asociados.')) {
            setError(null);
            try {
                await courseService.deleteCourse(id);
                console.log('Curso eliminado: ', id);
                await loadCoursesAndTeachers();
            } catch (err) {
                console.error('Error al eliminar curso: ', err);
                setError(err.response?.data?.message || 'Error al eliminar curso');
            }
        }
    };

    const resetForm = () => {
        setSelectedCourse(null);
        setIsEditing(false);
        setFormValues({
            nombre: '',
            descripcion: '',
            codigoCurso: '',
            docenteId: '',
        });
    };

    if (loading) {
        return <div>Cargando cursos y docentes...</div>;
    }

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <h4>{isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}</h4>
                <div>
                    <label htmlFor="nombre">Nombre:</label>
                    <input type="text" name="nombre" value={formValues.nombre} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea name="descripcion" value={formValues.descripcion} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label htmlFor="codigoCurso">Código de Curso:</label>
                    <input type="text" name="codigoCurso" value={formValues.codigoCurso} onChange={handleChange} required />
                </div>
                
                <div>
                    <label htmlFor="docenteId">Docente:</label>
                    <select
                        name="docenteId"
                        value={formValues.docenteId}
                        onChange={handleChange}
                        required={!isEditing}
                    >
                        <option value="">-- Seleccionar Docente --</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.nombre} {teacher.apellido} ({teacher.email})
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">{isEditing ? 'Actualizar Curso' : 'Crear Curso'}</button>
                {isEditing && <button type="button" onClick={resetForm}>Cancelar Edición</button>}
            </form>

            <hr />

            <h4>Lista de Cursos</h4>
            {courses.length === 0 && !loading && <p>No hay cursos registrados.</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Código</th>
                        <th>Docente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.nombre}</td>
                            <td>{course.descripcion}</td>
                            <td>{course.codigoCurso}</td>
                            <td>{course.docenteNombreCompleto || (course.docente ? `${course.docente.nombre} ${course.docente.apellido}` : 'Sin asignar')}</td>
                            <td>
                                <button onClick={() => handleEdit(course)}>Editar</button>
                                <button onClick={() => handleDelete(course.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CourseControl;
