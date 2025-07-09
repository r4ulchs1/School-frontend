import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import teacherCourseService from '../../services/teacher/courseService';
import userService from '../../services/admin/userService';
import courseService from '../../services/teacher/courseService';
import foroService from '../../services/foro/foroService';
import mensajeService from '../../services/foro/mensajeService';

function ForoPage() {
    const [misCursos, setMisCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioActualId, setUsuarioActualId] = useState(null);
    const [rolUsuario, setRolUsuario] = useState(null);

    const [cursoSeleccionadoParaForo, setCursoSeleccionadoParaForo] = useState(null);
    const [foroDelCurso, setForoDelCurso] = useState(null);
    const [mensajesDelForo, setMensajesDelForo] = useState([]);
    const [contenidoNuevoMensaje, setContenidoNuevoMensaje] = useState('');

    useEffect(() => {
        const usuarioActual = authService.getCurrentUser();
        if (usuarioActual && usuarioActual.id && usuarioActual.roles) {
            setUsuarioActualId(usuarioActual.id);
            if (usuarioActual.roles.includes('ROLE_ADMIN')) {
                setError('Los administradores no gestionan foros directamente aquí. Por favor, inicia sesión como docente o alumno.');
                setCargando(false);
            } else if (usuarioActual.roles.includes('ROLE_DOCENTE')) {
                setRolUsuario('DOCENTE');
            } else if (usuarioActual.roles.includes('ROLE_ALUMNO')) {
                setRolUsuario('ALUMNO');
            } else {
                setError('Rol de usuario no reconocido para esta página.');
                setCargando(false);
            }
        } else {
            setError('Acceso denegado. Por favor, inicia sesión.');
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (usuarioActualId && rolUsuario) {
            cargarCursosSegunRol();
        }
    }, [usuarioActualId, rolUsuario]);

    const cargarCursosSegunRol = async () => {
        setCargando(true);
        setError(null);
        try {
            let cursosFiltrados = [];

            if (rolUsuario === 'DOCENTE') {
                cursosFiltrados = await teacherCourseService.getCoursesByTeacher(usuarioActualId);
            } else if (rolUsuario === 'ALUMNO') {
                const alumnoCompleto = await userService.getUserById(usuarioActualId);
                const idsCursosInscritosAlumno = new Set(alumnoCompleto.cursosInscritosIds || []);

                const todosCursos = await courseService.getAllCourses();

                cursosFiltrados = todosCursos.filter(curso => idsCursosInscritosAlumno.has(curso.id));
            }
            setMisCursos(cursosFiltrados);
        } catch (err) {
            setError('Error al cargar tus cursos. Asegúrate de que el backend esté funcionando y tengas cursos asignados/inscritos.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const manejarAccesoForo = async (curso) => {
        setCursoSeleccionadoParaForo(curso);
        setCargando(true);
        setError(null);
        setForoDelCurso(null);
        setMensajesDelForo([]);
        setContenidoNuevoMensaje('');

        try {
            const foroEncontrado = await foroService.obtenerForoPorCurso(curso.id);
            setForoDelCurso(foroEncontrado);
            await cargarMensajesDelForo(foroEncontrado.id);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                if (rolUsuario === 'DOCENTE') {
                    setError('No se encontró un foro para este curso. Intentando crear uno...');
                    manejarCreacionForo(curso);
                } else {
                    setError('No se encontró un foro para este curso.');
                }
                setForoDelCurso(null);
            } else {
                setError(err.response?.data?.message || 'Error al cargar el foro del curso.');
            }
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const cerrarVistaForo = () => {
        setCursoSeleccionadoParaForo(null);
        setForoDelCurso(null);
        setMensajesDelForo([]);
        setContenidoNuevoMensaje('');
    };

    const cargarMensajesDelForo = async (foroId) => {
        setCargando(true);
        setError(null);
        try {
            const mensajes = await mensajeService.obtenerMensajesPorForo(foroId);
            setMensajesDelForo(mensajes);
        } catch (err) {
            setError('Error al cargar los mensajes del foro.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const manejarCreacionForo = async (cursoParaCrear = cursoSeleccionadoParaForo) => {
        if (!cursoParaCrear || rolUsuario !== 'DOCENTE') return;
        setError(null);
        setCargando(true);
        try {
            const nuevoForo = {
                titulo: `Foro del Curso: ${cursoParaCrear.nombre}`,
                descripcion: `Espacio de discusión para el curso ${cursoParaCrear.nombre}.`,
                cursoId: cursoParaCrear.id
            };
            const foroCreado = await foroService.crearForo(nuevoForo);
            setForoDelCurso(foroCreado);
            setError(null);
            await cargarMensajesDelForo(foroCreado.id);
            console.log('Foro creado:', foroCreado);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el foro. Puede que ya exista uno para este curso.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const manejarEnvioMensaje = async (e) => {
        e.preventDefault();
        if (!foroDelCurso || !contenidoNuevoMensaje.trim()) return;

        setError(null);
        setCargando(true);
        try {
            const usuarioActual = authService.getCurrentUser();
            if (!usuarioActual || !usuarioActual.id) {
                throw new Error('No se pudo obtener el ID del usuario actual.');
            }

            const nuevoMensaje = {
                contenido: contenidoNuevoMensaje,
                foroId: foroDelCurso.id,
                autorId: usuarioActual.id,
            };
            await mensajeService.crearMensaje(nuevoMensaje);
            console.log('Mensaje creado.');
            
            setContenidoNuevoMensaje('');
            await cargarMensajesDelForo(foroDelCurso.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar mensaje.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };



    if (cargando) {
        return <div>Cargando foros...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!usuarioActualId || !rolUsuario) {
        return <p>No se pudo determinar el rol o ID del usuario. Por favor, inicia sesión.</p>;
    }

    return (
        <div>
            <h2>Foros de Mis Cursos ({rolUsuario === 'DOCENTE' ? 'Docente' : 'Alumno'})</h2>
            {misCursos.length === 0 ? (
                <p>Actualmente no tienes cursos asignados.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID Curso</th>
                            <th>Nombre del Curso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {misCursos.map(curso => (
                            <tr key={curso.id}>
                                <td>{curso.id}</td>
                                <td>{curso.nombre}</td>
                                <td>
                                    <button onClick={() => manejarAccesoForo(curso)}>
                                        Acceder al Foro
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {cursoSeleccionadoParaForo && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Foro del Curso: {cursoSeleccionadoParaForo.nombre}</h3>
                    <button onClick={cerrarVistaForo} style={{ marginBottom: '15px' }}>Cerrar Foro</button>

                    {!foroDelCurso ? (
                        <div>
                            <p>Este curso no tiene un foro asociado.</p>
                            {rolUsuario === 'DOCENTE' && (
                                <button onClick={() => manejarCreacionForo(cursoSeleccionadoParaForo)}>Crear Foro para este Curso</button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h4>{foroDelCurso.titulo}</h4>
                            <p>{foroDelCurso.descripcion}</p>

                            <div style={{ border: '1px solid #eee', padding: '10px', maxHeight: '400px', overflowY: 'auto', marginBottom: '15px' }}>
                                <h5>Mensajes:</h5>
                                {mensajesDelForo.length === 0 ? (
                                    <p>No hay mensajes en este foro.</p>
                                ) : (
                                    <ul>
                                        {mensajesDelForo.map(mensaje => (
                                            <li key={mensaje.id} style={{ borderBottom: '1px dotted #ddd', padding: '8px 0' }}>
                                                <p><strong>{mensaje.autorNombreCompleto}</strong> ({new Date(mensaje.fechaCreacion).toLocaleString()}):</p>
                                                <p>{mensaje.contenido}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <form onSubmit={manejarEnvioMensaje}>
                                <h4>Escribir Mensaje</h4>
                                <textarea
                                    value={contenidoNuevoMensaje}
                                    onChange={(e) => setContenidoNuevoMensaje(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí..."
                                    rows="4"
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                                    required
                                ></textarea>
                                <button type="submit">Enviar Mensaje</button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ForoPage;
