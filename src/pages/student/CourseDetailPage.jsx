import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import courseService from '../../services/teacher/courseService';
import leccionService from '../../services/teacher/leccionService';
import recursoService from '../../services/teacher/recursoService';
import tareaService from '../../services/teacher/tareaService';
import entregaService from '../../services/teacher/entregaService';

function CourseDetailPage() {
    const { codigoCurso } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioActualId, setUsuarioActualId] = useState(null);

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonResources, setLessonResources] = useState([]);
    const [lessonTask, setLessonTask] = useState(null);
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const usuarioActual = authService.getCurrentUser();
        if (usuarioActual && usuarioActual.id && usuarioActual.roles && usuarioActual.roles.includes('ROLE_ALUMNO')) {
            setUsuarioActualId(usuarioActual.id);
        } else {
            setError('Acceso denegado. Esta página es solo para alumnos o no se pudo identificar al usuario.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (codigoCurso && usuarioActualId) {
            loadCourseAndContent();
        }
    }, [codigoCurso, usuarioActualId]);

    const loadCourseAndContent = async () => {
        setLoading(true);
        setError(null);
        try {
            const allCourses = await courseService.getAllCourses();
            const foundCourse = allCourses.find(c => c.codigoCurso === codigoCurso);

            if (!foundCourse) {
                setError('Curso no encontrado.');
                setLoading(false);
                return;
            }
            setCourse(foundCourse);

            const courseLessons = await leccionService.obtenerLeccionesPorCurso(foundCourse.id);
            setLessons(courseLessons);

        } catch (err) {
            setError('Error al cargar el curso y su contenido.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLesson = async (lesson) => {
        setSelectedLesson(lesson);
        setLoading(true);
        setError(null);
        setLessonResources([]);
        setLessonTask(null);
        setCurrentSubmission(null);
        setSubmissionContent('');
        setIsSubmitting(false);

        try {
            const resources = await recursoService.obtenerRecursosPorLeccion(lesson.id);
            setLessonResources(resources);

            const tasks = await tareaService.obtenerTareasPorLeccion(lesson.id);
            const task = tasks.length > 0 ? tasks[0] : null;
            setLessonTask(task);

            if (task) {
                try {
                    const submission = await entregaService.obtenerEntregaPorTareaYAlumno(task.id, usuarioActualId);
                    setCurrentSubmission(submission);
                    setSubmissionContent(submission.contenido || '');
                } catch (submissionErr) {
                    if (submissionErr.response && submissionErr.response.status === 404) {
                        setCurrentSubmission(null);
                        setSubmissionContent('');
                    } else {
                        console.error('Error al cargar la entrega existente:', submissionErr);
                        setError('Error al cargar la entrega.');
                    }
                }
            }

        } catch (err) {
            setError('Error al cargar el contenido de la lección.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmissionContentChange = (e) => {
        setSubmissionContent(e.target.value);
    };

    const handleSubmitSubmission = async (e) => {
        e.preventDefault();
        if (currentSubmission) {
            setError('Ya has enviado esta tarea. No se permiten actualizaciones.');
            return;
        }

        if (!lessonTask || !usuarioActualId || !submissionContent.trim()) {
            setError('Contenido de la entrega vacío o tarea no seleccionada.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const entregaData = {
            contenido: submissionContent,
            tareaId: lessonTask.id,
            alumnoId: usuarioActualId,
        };

        try {
            const resultSubmission = await entregaService.crearEntrega(entregaData);
            console.log('Entrega creada:', resultSubmission);
            setCurrentSubmission(resultSubmission);
            alert('Entrega guardada exitosamente.');
            setSubmissionContent('');
        } catch (err) {
            console.error('Error al guardar la entrega:', err);
            setError(err.response?.data?.message || 'Error al guardar la entrega.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div>Cargando detalles del curso...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!course) {
        return <p>No se pudo cargar la información del curso.</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/student/courses')} style={{ marginBottom: '20px' }}>
                &larr; Volver a Mis Cursos
            </button>
            <h2>Curso: {course.nombre} ({course.codigoCurso})</h2>
            <p><strong>Descripción:</strong> {course.descripcion}</p>
            <p><strong>Docente:</strong> {course.docenteNombreCompleto || (course.docente ? `${course.docente.nombre} ${course.docente.apellido}` : 'Sin asignar')}</p>

            <hr style={{ margin: '20px 0' }} />

            <h3>Lecciones del Curso</h3>
            {lessons.length === 0 ? (
                <p>Este curso aún no tiene lecciones.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <div>
                        <h4>Lista de Lecciones</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {lessons.map(lesson => (
                                <li
                                    key={lesson.id}
                                    style={{
                                        border: '1px solid #eee',
                                        borderRadius: '5px',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                        backgroundColor: selectedLesson && selectedLesson.id === lesson.id ? '#e6f7ff' : '#fff',
                                        fontWeight: selectedLesson && selectedLesson.id === lesson.id ? 'bold' : 'normal',
                                    }}
                                    onClick={() => handleSelectLesson(lesson)}
                                >
                                    {lesson.titulo}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        {selectedLesson ? (
                            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#f0f8ff' }}>
                                <h4>Lección: {selectedLesson.titulo}</h4>
                                <p>Descripción: {selectedLesson.descripcion}</p>

                                <h5>Recursos:</h5>
                                {lessonResources.length === 0 ? (
                                    <p>No hay recursos para esta lección.</p>
                                ) : (
                                    <ul>
                                        {lessonResources.map(resource => (
                                            <li key={resource.id}>
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                    {resource.nombre} ({resource.tipo})
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <h5>Tarea:</h5>
                                {lessonTask ? (
                                    <div>
                                        <p><strong>Título:</strong> {lessonTask.titulo}</p>
                                        <p><strong>Descripción:</strong> {lessonTask.descripcion}</p>
                                        <p><strong>Fecha Vencimiento:</strong> {lessonTask.fechaVencimiento ? new Date(lessonTask.fechaVencimiento).toLocaleString() : 'N/A'}</p>
                                        <p><strong>Estado:</strong> {lessonTask.estado}</p>

                                        <div style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                            <h6>Tu Entrega:</h6>
                                            {currentSubmission ? (
                                                <div>
                                                    <p><strong>Estado:</strong> {currentSubmission.estado}</p>
                                                    <p><strong>Calificación:</strong> {currentSubmission.calificacion !== null ? currentSubmission.calificacion : 'Pendiente'}</p>
                                                    <p><strong>Comentarios del Docente:</strong> {currentSubmission.comentariosDocente || 'N/A'}</p>
                                                    <p><strong>Contenido Enviado:</strong> {currentSubmission.contenido}</p>
                                                    {currentSubmission.fechaEnvio && <p><strong>Fecha de Envío:</strong> {new Date(currentSubmission.fechaEnvio).toLocaleString()}</p>}
                                                    <p style={{ color: 'green', fontWeight: 'bold' }}>¡Tarea enviada!</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p>Aún no has enviado esta tarea.</p>
                                                    <form onSubmit={handleSubmitSubmission} style={{ marginTop: '10px' }}>
                                                        <textarea
                                                            value={submissionContent}
                                                            onChange={handleSubmissionContentChange}
                                                            placeholder="Escribe tu entrega aquí..."
                                                            rows="6"
                                                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                                                            required
                                                        ></textarea>
                                                        <button type="submit" disabled={isSubmitting}>
                                                            {isSubmitting ? 'Enviando...' : 'Enviar Entrega'}
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p>No hay tarea asignada para esta lección.</p>
                                )}
                            </div>
                        ) : (
                            <p>Selecciona una lección para ver su contenido.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseDetailPage;
