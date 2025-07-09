import React, { useState, useEffect } from 'react';
import teacherCourseService from '../../services/teacher/courseService';
import authService from '../../services/authService';
import leccionService from '../../services/teacher/leccionService';
import recursoService from '../../services/teacher/recursoService';
import tareaService from '../../services/teacher/tareaService';

function CourseTeacher() {
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);

    const [cursoSeleccionadoParaLecciones, setCursoSeleccionadoParaLecciones] = useState(null);
    const [lecciones, setLecciones] = useState([]);
    const [mostrarFormularioLeccion, setMostrarFormularioLeccion] = useState(false);
    const [valoresFormularioLeccion, setValoresFormularioLeccion] = useState({
        titulo: '',
        descripcion: '',
        cursoId: '',
    });
    const [estaEditandoLeccion, setEstaEditandoLeccion] = useState(false);
    const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

    const [leccionSeleccionadaParaRecursos, setLeccionSeleccionadaParaRecursos] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [mostrarFormularioRecurso, setMostrarFormularioRecurso] = useState(false);
    const [valoresFormularioRecurso, setValoresFormularioRecurso] = useState({
        nombre: '',
        tipo: 'VIDEO',
        url: '',
        leccionId: '',
    });
    const [estaEditandoRecurso, setEstaEditandoRecurso] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);

    const [leccionSeleccionadaParaTarea, setLeccionSeleccionadaParaTarea] = useState(null);
    const [tarea, setTarea] = useState(null);
    const [mostrarFormularioTarea, setMostrarFormularioTarea] = useState(false);
    const [valoresFormularioTarea, setValoresFormularioTarea] = useState({
        titulo: '',
        descripcion: '',
        fechaVencimiento: '',
        estado: 'PENDIENTE',
        leccionId: '',
    });
    const [estaEditandoTarea, setEstaEditandoTarea] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.roles && currentUser.roles.includes('ROLE_DOCENTE')) {
            setTeacherId(currentUser.id);
        } else {
            setError('Acceso denegado. Esta página es solo para docentes.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (teacherId) {
            loadTeacherCourses();
        }
    }, [teacherId]);

    const loadTeacherCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const courses = await teacherCourseService.getCoursesByTeacher(teacherId);
            setMyCourses(courses);
        } catch (err) {
            setError('Error al cargar tus cursos. Asegúrate de que el backend esté funcionando y tengas cursos asignados.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const manejarGestionLecciones = async (curso) => {
        setCursoSeleccionadoParaLecciones(curso);
        setLoading(true);
        setError(null);
        setLeccionSeleccionadaParaRecursos(null);
        setLeccionSeleccionadaParaTarea(null);

        try {
            const leccionesDelCurso = await leccionService.obtenerLeccionesPorCurso(curso.id);
            setLecciones(leccionesDelCurso);
            setMostrarFormularioLeccion(false);
            setEstaEditandoLeccion(false);
            setLeccionSeleccionada(null);
            setValoresFormularioLeccion({ titulo: '', descripcion: '', cursoId: '' });
        } catch (err) {
            setError('Error al cargar lecciones del curso.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cerrarVistaLecciones = () => {
        setCursoSeleccionadoParaLecciones(null);
        setLecciones([]);
        setMostrarFormularioLeccion(false);
        setEstaEditandoLeccion(false);
        setLeccionSeleccionada(null);
        setValoresFormularioLeccion({ titulo: '', descripcion: '', cursoId: '' });
        setLeccionSeleccionadaParaRecursos(null);
        setLeccionSeleccionadaParaTarea(null);
    };

    const mostrarFormularioCrearLeccion = () => {
        setMostrarFormularioLeccion(true);
        setEstaEditandoLeccion(false);
        setLeccionSeleccionada(null);
        setValoresFormularioLeccion({
            titulo: '',
            descripcion: '',
            cursoId: cursoSeleccionadoParaLecciones.id,
        });
    };

    const manejarEdicionLeccion = (leccion) => {
        setMostrarFormularioLeccion(true);
        setEstaEditandoLeccion(true);
        setLeccionSeleccionada(leccion);
        setValoresFormularioLeccion({
            titulo: leccion.titulo,
            descripcion: leccion.descripcion,
            cursoId: leccion.cursoId,
        });
    };

    const manejarCambioFormularioLeccion = (e) => {
        const { name, value } = e.target;
        setValoresFormularioLeccion({ ...valoresFormularioLeccion, [name]: value });
    };

    const manejarEnvioLeccion = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (estaEditandoLeccion) {
                await leccionService.actualizarLeccion(leccionSeleccionada.id, valoresFormularioLeccion);
                console.log('Lección actualizada');
            } else {
                await leccionService.crearLeccion(valoresFormularioLeccion);
                console.log('Lección creada');
            }
            await manejarGestionLecciones(cursoSeleccionadoParaLecciones);
        } catch (err) {
            console.error('Error al guardar lección:', err);
            setError(err.response?.data?.message || 'Error al guardar lección');
        }
    };

    const manejarEliminacionLeccion = async (idLeccion) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
            setError(null);
            try {
                await leccionService.eliminarLeccion(idLeccion);
                console.log('Lección eliminada:', idLeccion);
                await manejarGestionLecciones(cursoSeleccionadoParaLecciones);
            } catch (err) {
                console.error('Error al eliminar lección:', err);
                setError(err.response?.data?.message || 'Error al eliminar lección');
            }
        }
    };

    const manejarGestionRecursos = async (leccion) => {
        setLeccionSeleccionadaParaRecursos(leccion);
        setLoading(true);
        setError(null);
        setLeccionSeleccionadaParaTarea(null);
        try {
            const recursosDeLeccion = await recursoService.obtenerRecursosPorLeccion(leccion.id);
            setRecursos(recursosDeLeccion);
            setMostrarFormularioRecurso(false);
            setEstaEditandoRecurso(false);
            setRecursoSeleccionado(null);
            setValoresFormularioRecurso({ nombre: '', tipo: 'VIDEO', url: '', leccionId: '' });
        } catch (err) {
            setError('Error al cargar recursos de la lección.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cerrarVistaRecursos = () => {
        setLeccionSeleccionadaParaRecursos(null);
        setRecursos([]);
        setMostrarFormularioRecurso(false);
        setEstaEditandoRecurso(false);
        setRecursoSeleccionado(null);
        setValoresFormularioRecurso({ nombre: '', tipo: 'VIDEO', url: '', leccionId: '' });
    };

    const mostrarFormularioCrearRecurso = () => {
        setMostrarFormularioRecurso(true);
        setEstaEditandoRecurso(false);
        setRecursoSeleccionado(null);
        setValoresFormularioRecurso({
            nombre: '',
            tipo: 'VIDEO',
            url: '',
            leccionId: leccionSeleccionadaParaRecursos.id,
        });
    };

    const manejarEdicionRecurso = (recurso) => {
        setMostrarFormularioRecurso(true);
        setEstaEditandoRecurso(true);
        setRecursoSeleccionado(recurso);
        setValoresFormularioRecurso({
            nombre: recurso.nombre,
            tipo: recurso.tipo,
            url: recurso.url,
            leccionId: recurso.leccionId,
        });
    };

    const manejarCambioFormularioRecurso = (e) => {
        const { name, value } = e.target;
        setValoresFormularioRecurso({ ...valoresFormularioRecurso, [name]: value });
    };

    const manejarEnvioRecurso = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (estaEditandoRecurso) {
                await recursoService.actualizarRecurso(recursoSeleccionado.id, valoresFormularioRecurso);
                console.log('Recurso actualizado');
            } else {
                await recursoService.crearRecurso(valoresFormularioRecurso);
                console.log('Recurso creado');
            }
            await manejarGestionRecursos(leccionSeleccionadaParaRecursos);
        } catch (err) {
            console.error('Error al guardar recurso:', err);
            setError(err.response?.data?.message || 'Error al guardar recurso');
        }
    };

    const manejarEliminacionRecurso = async (idRecurso) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
            setError(null);
            try {
                await recursoService.eliminarRecurso(idRecurso);
                console.log('Recurso eliminado:', idRecurso);
                await manejarGestionRecursos(leccionSeleccionadaParaRecursos);
            } catch (err) {
                console.error('Error al eliminar recurso:', err);
                setError(err.response?.data?.message || 'Error al eliminar recurso');
            }
        }
    };

    const manejarGestionTarea = async (leccion) => {
        setLeccionSeleccionadaParaTarea(leccion);
        setLoading(true);
        setError(null);
        setLeccionSeleccionadaParaRecursos(null);
        try {
            const tareasDeLeccion = await tareaService.obtenerTareasPorLeccion(leccion.id);
            setTarea(tareasDeLeccion.length > 0 ? tareasDeLeccion[0] : null);
            setMostrarFormularioTarea(false);
            setEstaEditandoTarea(false);
            setValoresFormularioTarea({
                titulo: '',
                descripcion: '',
                fechaVencimiento: '',
                estado: 'PENDIENTE',
                leccionId: '',
            });
        } catch (err) {
            setError('Error al cargar la tarea de la lección.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cerrarVistaTarea = () => {
        setLeccionSeleccionadaParaTarea(null);
        setTarea(null);
        setMostrarFormularioTarea(false);
        setEstaEditandoTarea(false);
        setValoresFormularioTarea({ titulo: '', descripcion: '', fechaVencimiento: '', estado: 'PENDIENTE', leccionId: '' });
    };

    const mostrarFormularioCrearEditarTarea = (tareaExistente = null) => {
        setMostrarFormularioTarea(true);
        if (tareaExistente) {
            setEstaEditandoTarea(true);
            setValoresFormularioTarea({
                titulo: tareaExistente.titulo,
                descripcion: tareaExistente.descripcion,
                fechaVencimiento: tareaExistente.fechaVencimiento ? tareaExistente.fechaVencimiento.substring(0, 16) : '', // Formato para input datetime-local
                estado: tareaExistente.estado,
                leccionId: tareaExistente.leccionId,
            });
        } else {
            setEstaEditandoTarea(false);
            setValoresFormularioTarea({
                titulo: '',
                descripcion: '',
                fechaVencimiento: '',
                estado: 'PENDIENTE',
                leccionId: leccionSeleccionadaParaTarea.id,
            });
        }
    };

    const manejarCambioFormularioTarea = (e) => {
        const { name, value } = e.target;
        setValoresFormularioTarea({ ...valoresFormularioTarea, [name]: value });
    };

    const manejarEnvioTarea = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const tareaData = {
                ...valoresFormularioTarea,
                fechaVencimiento: valoresFormularioTarea.fechaVencimiento ? new Date(valoresFormularioTarea.fechaVencimiento).toISOString() : null,
            };

            if (estaEditandoTarea && tarea) {
                await tareaService.actualizarTarea(tarea.id, tareaData);
                console.log('Tarea actualizada');
            } else {
                await tareaService.crearTarea(tareaData);
                console.log('Tarea creada');
            }
            await manejarGestionTarea(leccionSeleccionadaParaTarea); // Recargar tarea
        } catch (err) {
            console.error('Error al guardar tarea:', err);
            setError(err.response?.data?.message || 'Error al guardar tarea');
        }
    };

    const manejarEliminacionTarea = async () => {
        if (!tarea || !window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
        setError(null);
        try {
            await tareaService.eliminarTarea(tarea.id);
            console.log('Tarea eliminada:', tarea.id);
            setTarea(null);
            setMostrarFormularioTarea(false);
            setEstaEditandoTarea(false);
            setValoresFormularioTarea({ titulo: '', descripcion: '', fechaVencimiento: '', estado: 'PENDIENTE', leccionId: '' });
        } catch (err) {
            console.error('Error al eliminar tarea:', err);
            setError(err.response?.data?.message || 'Error al eliminar tarea');
        }
    };


    if (loading) {
        return <div>Cargando tus cursos...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!teacherId) {
        return <p>No se ha encontrado un ID de docente. Por favor, asegúrate de iniciar sesión como docente.</p>;
    }

    return (
        <div>
            <h2>Mis Cursos</h2>
            {myCourses.length === 0 ? (
                <p>Actualmente no tienes cursos asignados.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Curso</th>
                            <th>Descripción</th>
                            <th>Código</th>
                            <th>Alumnos Inscritos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myCourses.map(course => (
                            <tr key={course.id}>
                                <td>{course.id}</td>
                                <td>{course.nombre}</td>
                                <td>{course.descripcion}</td>
                                <td>{course.codigoCurso}</td>
                                <td>{course.alumnosInscritosIds ? course.alumnosInscritosIds.length : 0}</td>
                                <td>
                                    <button onClick={() => manejarGestionLecciones(course)}>
                                        Gestionar Lecciones
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {cursoSeleccionadoParaLecciones && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Lecciones del Curso: {cursoSeleccionadoParaLecciones.nombre}</h3>
                    <button onClick={mostrarFormularioCrearLeccion}>Crear Nueva Lección</button>
                    <button onClick={cerrarVistaLecciones} style={{ marginLeft: '10px' }}>Cerrar Lecciones</button>

                    {mostrarFormularioLeccion && (
                        <form onSubmit={manejarEnvioLeccion} style={{ marginTop: '20px', border: '1px dashed #eee', padding: '15px' }}>
                            <h4>{estaEditandoLeccion ? 'Editar Lección' : 'Crear Lección'}</h4>
                            <div>
                                <label htmlFor="titulo">Título:</label>
                                <input type="text" name="titulo" value={valoresFormularioLeccion.titulo} onChange={manejarCambioFormularioLeccion} required />
                            </div>
                            <div>
                                <label htmlFor="descripcion">Descripción:</label>
                                <textarea name="descripcion" value={valoresFormularioLeccion.descripcion} onChange={manejarCambioFormularioLeccion}></textarea>
                            </div>
                            <button type="submit">{estaEditandoLeccion ? 'Actualizar Lección' : 'Guardar Lección'}</button>
                            <button type="button" onClick={() => setMostrarFormularioLeccion(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
                        </form>
                    )}

                    <h4>Lista de Lecciones</h4>
                    {lecciones.length === 0 && !loading ? (
                        <p>No hay lecciones para este curso.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lecciones.map(leccion => (
                                    <tr key={leccion.id}>
                                        <td>{leccion.id}</td>
                                        <td>{leccion.titulo}</td>
                                        <td>{leccion.descripcion}</td>
                                        <td>
                                            <button onClick={() => manejarEdicionLeccion(leccion)}>Editar</button>
                                            <button onClick={() => manejarEliminacionLeccion(leccion.id)}>Eliminar</button>
                                            <button onClick={() => manejarGestionRecursos(leccion)}>Recursos</button>
                                            <button onClick={() => manejarGestionTarea(leccion)}>Tarea</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {leccionSeleccionadaParaRecursos && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Recursos de la Lección: {leccionSeleccionadaParaRecursos.titulo}</h3>
                    <button onClick={mostrarFormularioCrearRecurso}>Crear Nuevo Recurso</button>
                    <button onClick={cerrarVistaRecursos} style={{ marginLeft: '10px' }}>Cerrar Recursos</button>

                    {mostrarFormularioRecurso && (
                        <form onSubmit={manejarEnvioRecurso} style={{ marginTop: '20px', border: '1px dashed #eee', padding: '15px' }}>
                            <h4>{estaEditandoRecurso ? 'Editar Recurso' : 'Crear Recurso'}</h4>
                            <div>
                                <label htmlFor="nombreRecurso">Nombre:</label>
                                <input type="text" name="nombre" value={valoresFormularioRecurso.nombre} onChange={manejarCambioFormularioRecurso} required />
                            </div>
                            <div>
                                <label htmlFor="tipoRecurso">Tipo:</label>
                                <select name="tipo" value={valoresFormularioRecurso.tipo} onChange={manejarCambioFormularioRecurso} required>
                                    <option value="VIDEO">VIDEO</option>
                                    <option value="DOCUMENTO">DOCUMENTO</option>
                                    <option value="ENLACE">ENLACE</option>
                                    <option value="IMAGEN">IMAGEN</option>
                                    <option value="AUDIO">AUDIO</option>
                                    <option value="OTROS">OTROS</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="urlRecurso">URL:</label>
                                <input type="text" name="url" value={valoresFormularioRecurso.url} onChange={manejarCambioFormularioRecurso} required />
                            </div>
                            <button type="submit">{estaEditandoRecurso ? 'Actualizar Recurso' : 'Guardar Recurso'}</button>
                            <button type="button" onClick={() => setMostrarFormularioRecurso(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
                        </form>
                    )}

                    <h4>Lista de Recursos</h4>
                    {recursos.length === 0 && !loading ? (
                        <p>No hay recursos para esta lección.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>URL</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recursos.map(recurso => (
                                    <tr key={recurso.id}>
                                        <td>{recurso.id}</td>
                                        <td>{recurso.nombre}</td>
                                        <td>{recurso.tipo}</td>
                                        <td><a href={recurso.url} target="_blank" rel="noopener noreferrer">{recurso.url}</a></td>
                                        <td>
                                            <button onClick={() => manejarEdicionRecurso(recurso)}>Editar</button>
                                            <button onClick={() => manejarEliminacionRecurso(recurso.id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {leccionSeleccionadaParaTarea && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Tarea de la Lección: {leccionSeleccionadaParaTarea.titulo}</h3>
                    
                    {!tarea ? (
                        <button onClick={() => mostrarFormularioCrearEditarTarea()}>Crear Tarea</button>
                    ) : (
                        <div>
                            <h4>Detalles de la Tarea</h4>
                            <p><strong>Título:</strong> {tarea.titulo}</p>
                            <p><strong>Descripción:</strong> {tarea.descripcion}</p>
                            <p><strong>Fecha Vencimiento:</strong> {tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleString() : 'N/A'}</p>
                            <p><strong>Estado:</strong> {tarea.estado}</p>
                            <button onClick={() => mostrarFormularioCrearEditarTarea(tarea)}>Editar Tarea</button>
                            <button onClick={manejarEliminacionTarea} style={{ marginLeft: '10px' }}>Eliminar Tarea</button>
                        </div>
                    )}
                    <button onClick={cerrarVistaTarea} style={{ marginLeft: '10px' }}>Cerrar Tarea</button>

                    {mostrarFormularioTarea && (
                        <form onSubmit={manejarEnvioTarea} style={{ marginTop: '20px', border: '1px dashed #eee', padding: '15px' }}>
                            <h4>{estaEditandoTarea ? 'Editar Tarea' : 'Crear Tarea'}</h4>
                            <div>
                                <label htmlFor="tituloTarea">Título:</label>
                                <input type="text" name="titulo" value={valoresFormularioTarea.titulo} onChange={manejarCambioFormularioTarea} required />
                            </div>
                            <div>
                                <label htmlFor="descripcionTarea">Descripción:</label>
                                <textarea name="descripcion" value={valoresFormularioTarea.descripcion} onChange={manejarCambioFormularioTarea}></textarea>
                            </div>
                            <div>
                                <label htmlFor="fechaVencimientoTarea">Fecha Vencimiento:</label>
                                <input type="datetime-local" name="fechaVencimiento" value={valoresFormularioTarea.fechaVencimiento} onChange={manejarCambioFormularioTarea} required />
                            </div>
                            <div>
                                <label htmlFor="estadoTarea">Estado:</label>
                                <select name="estado" value={valoresFormularioTarea.estado} onChange={manejarCambioFormularioTarea} required>
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="VENCIDA">VENCIDA</option>
                                    <option value="COMPLETADA">COMPLETADA</option>
                                </select>
                            </div>
                            <button type="submit">{estaEditandoTarea ? 'Actualizar Tarea' : 'Guardar Tarea'}</button>
                            <button type="button" onClick={() => setMostrarFormularioTarea(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default CourseTeacher;
