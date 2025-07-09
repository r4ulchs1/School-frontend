// src/pages/admin/StudentControl.jsx
import { useEffect, useState } from "react";
import userService from "../../services/admin/userService";
import courseService from "../../services/admin/courseService";

function StudentControl() {
    const [alumnos, setAlumnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [estaEditando, setEstaEditando] = useState(false);
    const [valoresFormulario, setValoresFormulario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        rol: 'ALUMNO'
    });

    // Gestión de Matrícula
    const [alumnoParaGestionarMatricula, setAlumnoParaGestionarMatricula] = useState(null);
    const [todosLosCursos, setTodosLosCursos] = useState([]);
    const [cursosInscritos, setCursosInscritos] = useState([]);
    const [cursosDisponibles, setCursosDisponibles] = useState([]);

    useEffect(() => {
        cargarAlumnosYCursos();
    }, []);

    const cargarAlumnosYCursos = async () => {
        setCargando(true);
        setError(null);
        try {
            const todosLosUsuarios = await userService.getAllUsers();
            const soloAlumnos = todosLosUsuarios.filter(usuario => usuario.rol === 'ALUMNO');
            setAlumnos(soloAlumnos);

            const datosCursos = await courseService.getAllCourses();
            setTodosLosCursos(datosCursos);
        } catch (err) {
            setError('Error al cargar datos');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setValoresFormulario({ ...valoresFormulario, [name]: value });
    }

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError(null);
        const datosAEnviar = { ...valoresFormulario, rol: 'ALUMNO' };

        if (estaEditando && datosAEnviar.password === '') {
            delete datosAEnviar.password;
        }
        try {
            if (estaEditando) {
                await userService.updateUser(alumnoSeleccionado.id, datosAEnviar);
                console.log('Alumno Actualizado');
            } else {
                await userService.createUser(datosAEnviar);
                console.log('Alumno Creado');
            }
            await cargarAlumnosYCursos();
            reiniciarFormulario();
            if (alumnoParaGestionarMatricula && alumnoSeleccionado && alumnoParaGestionarMatricula.id === alumnoSeleccionado.id) {
                 const alumnoActualizado = await userService.getUserById(alumnoSeleccionado.id); // Obtener el alumno actualizado
                 manejarGestionMatricula(alumnoActualizado); // Re-abrir la gestión con datos frescos
            }
        } catch (err) {
            console.error('Error al guardar: ', err);
            setError(err.response?.data?.message || 'Error al guardar');
        }
    }

    const manejarEdicion = (alumno) => {
        setAlumnoParaGestionarMatricula(null);
        setAlumnoSeleccionado(alumno);
        setEstaEditando(true);
        setValoresFormulario({
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            email: alumno.email,
            telefono: alumno.telefono,
            password: '',
            rol: 'ALUMNO'
        });
    }

    const manejarEliminacion = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
            setError(null);
            try {
                await userService.deleteUser(id);
                console.log('Alumno eliminado: ', id);
                await cargarAlumnosYCursos();
                if (alumnoParaGestionarMatricula && alumnoParaGestionarMatricula.id === id) {
                    setAlumnoParaGestionarMatricula(null);
                }
            } catch (err) {
                console.error('Error al eliminar: ', err);
                setError(err.response?.data?.message || 'Error al eliminar');
            }
        }
    }

    const reiniciarFormulario = () => {
        setAlumnoSeleccionado(null);
        setEstaEditando(false);
        setValoresFormulario({
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            password: '',
            rol: 'ALUMNO'
        });
    }

    const manejarGestionMatricula = (alumno) => {
        if (alumnoParaGestionarMatricula && alumnoParaGestionarMatricula.id === alumno.id) {
            setAlumnoParaGestionarMatricula(null);
            setCursosInscritos([]);
            setCursosDisponibles([]);
        } else {
            setAlumnoParaGestionarMatricula(alumno);
            const idsCursosInscritosAlumno = new Set(alumno.cursosInscritosIds || []);

            const cursosInscritosActuales = todosLosCursos.filter(curso => idsCursosInscritosAlumno.has(curso.id));
            console.log(todosLosCursos);
            console.log(idsCursosInscritosAlumno)

            setCursosInscritos(cursosInscritosActuales);

            const cursosDisponiblesActuales = todosLosCursos.filter(curso => !idsCursosInscritosAlumno.has(curso.id));
            setCursosDisponibles(cursosDisponiblesActuales);
            
            reiniciarFormulario(); 

        }
    };

    const inscribirCurso = async (idCurso) => {
        if (!alumnoParaGestionarMatricula) return;
        setError(null);
        try {
            const alumnoActualizado = await userService.inscribirAlumnoEnCurso(alumnoParaGestionarMatricula.id, idCurso);
            console.log('Alumno inscrito en curso:', alumnoActualizado);
            
            const alumnoActualizadoConDetalles = await userService.getUserById(alumnoParaGestionarMatricula.id);
            console.log("Alumno con cursos actualizados (desde backend):", alumnoActualizadoConDetalles);
           
            await cargarAlumnosYCursos();
        } catch (err) {
            console.error('Error al inscribir alumno:', err);
            setError(err.response?.data?.message || 'Error al inscribir al alumno en el curso');
        }
    };

    const desinscribirCurso = async (idCurso) => {
        if (!alumnoParaGestionarMatricula) return;
        setError(null);
        try {
            const alumnoActualizado = await userService.desinscribirAlumnoDeCurso(alumnoParaGestionarMatricula.id, idCurso);
            console.log('Alumno desinscrito de curso:', alumnoActualizado);

            await cargarAlumnosYCursos(); // Recargar todos los alumnos y cursos
            const alumnoFresco = alumnos.find(a => a.id === alumnoActualizado.id);
            if (alumnoFresco) {
                manejarGestionMatricula(alumnoFresco); // Re-renderizar la sección de gestión con datos frescos
            }
        } catch (err) {
            console.error('Error al desinscribir alumno:', err);
            setError(err.response?.data?.message || 'Error al desinscribir al alumno del curso');
        }
    };

    if (cargando) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={manejarEnvio}>
                <h4>{estaEditando ? 'Editar Alumno' : 'Crear Alumno'}</h4>
                <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" name="nombre" value={valoresFormulario.nombre} onChange={manejarCambio} required />

                    <label htmlFor="apellido">Apellido</label>
                    <input type="text" name="apellido" value={valoresFormulario.apellido} onChange={manejarCambio} required />

                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" value={valoresFormulario.email} onChange={manejarCambio} required />

                    <label htmlFor="telefono">Teléfono</label>
                    <input type="text" name="telefono" value={valoresFormulario.telefono} onChange={manejarCambio} />

                    <label htmlFor="password">Contraseña (solo si se crea o se cambia):</label>
                    <input type="password" name="password" value={valoresFormulario.password} onChange={manejarCambio} required={!estaEditando} />

                    <input type="hidden" name="rol" value={'ALUMNO'} />
                </div>
                <button type="submit">{estaEditando ? 'Actualizar Alumno' : 'Registrar Alumno'}</button>
                <button type="button" onClick={reiniciarFormulario}>Cancelar</button>
            </form>

            <hr />

            <h4>Lista de Alumnos</h4>
            {alumnos.length === 0 && !cargando && <p>No hay alumnos registrados.</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Cursos Inscritos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {alumnos.map(alumno => (
                        <tr key={alumno.id}>
                            <td>{alumno.id}</td>
                            <td>{alumno.nombre} {alumno.apellido}</td>
                            <td>{alumno.email}</td>
                            <td>{alumno.telefono}</td>
                            <td>
                                {alumno.alumnosInscritosIds && alumno.alumnosInscritosIds.length > 0
                                    ? `Inscrito en ${alumno.alumnosInscritosIds.length} curso(s)`
                                    : 'Ninguno'}
                            </td>
                            <td>
                                <button onClick={() => manejarEdicion(alumno)}>Editar</button>
                                <button onClick={() => manejarEliminacion(alumno.id)}>Eliminar</button>
                                <button onClick={() => manejarGestionMatricula(alumno)}>Gestionar Cursos</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            //MAtricula
            {alumnoParaGestionarMatricula && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Gestionar Cursos para: {alumnoParaGestionarMatricula.nombre} {alumnoParaGestionarMatricula.apellido}</h3>
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <h4>Cursos Inscritos</h4>
                    {cursosInscritos.length === 0 ? (
                        <p>Este alumno no está inscrito en ningún curso.</p>
                    ) : (
                        <ul>
                            {cursosInscritos.map(curso => (
                                <li key={curso.id}>
                                    {curso.nombre} ({curso.codigoCurso})
                                    <button onClick={() => desinscribirCurso(curso.id)} style={{ marginLeft: '10px' }}>Desinscribir</button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h4>Cursos Disponibles</h4>
                    {cursosDisponibles.length === 0 ? (
                        <p>No hay cursos disponibles para inscribir.</p>
                    ) : (
                        <ul>
                            {cursosDisponibles.map(curso => (
                                <li key={curso.id}>
                                    {curso.nombre} ({curso.codigoCurso})
                                    <button onClick={() => inscribirCurso(curso.id)} style={{ marginLeft: '10px' }}>Inscribir</button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button onClick={() => setAlumnoParaGestionarMatricula(null)} style={{ marginTop: '20px' }}>Cerrar Gestión</button>
                </div>
            )}
        </div>
    );
}

export default StudentControl;
