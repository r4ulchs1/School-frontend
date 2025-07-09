import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import teacherCourseService from '../../services/teacher/courseService';
import leccionService from '../../services/teacher/leccionService';
import tareaService from '../../services/teacher/tareaService';
import entregaService from '../../services/teacher/entregaService';
import userService from '../../services/admin/userService';
import notificationService from '../../services/notifiService';

function TaskTeacher() {
    const [teacherCourses, setTeacherCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [lessonTask, setLessonTask] = useState(null);

    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);
    const [grade, setGrade] = useState('');
    const [comments, setComments] = useState('');
    const [isSavingReview, setIsSavingReview] = useState(false);

    const [whatsAppMessage, setWhatsAppMessage] = useState('');
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [whatsAppError, setWhatsAppError] = useState(null);
    const [whatsAppSuccess, setWhatsAppSuccess] = useState(null);


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
            setTeacherCourses(courses);
        } catch (err) {
            setError('Error al cargar tus cursos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = async (courseId) => {
        setLoading(true);
        setError(null);
        const course = teacherCourses.find(c => c.id === parseInt(courseId));
        setSelectedCourse(course);
        setLessons([]);
        setSelectedLesson(null);
        setLessonTask(null);
        setStudentSubmissions([]);
        setSelectedSubmissionForReview(null);
        setGrade('');
        setComments('');
        setWhatsAppMessage('');
        setWhatsAppError(null);
        setWhatsAppSuccess(null);

        if (course) {
            try {
                const courseLessons = await leccionService.obtenerLeccionesPorCurso(course.id);
                setLessons(courseLessons);
            } catch (err) {
                setError('Error al cargar las lecciones del curso.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const handleLessonSelect = async (lesson) => {
        setSelectedLesson(lesson);
        setLoading(true);
        setError(null);
        setLessonTask(null);
        setStudentSubmissions([]);
        setSelectedSubmissionForReview(null);
        setGrade('');
        setComments('');
        setWhatsAppMessage('');
        setWhatsAppError(null);
        setWhatsAppSuccess(null);

        try {
            const tasks = await tareaService.obtenerTareasPorLeccion(lesson.id);
            const task = tasks.length > 0 ? tasks[0] : null;
            setLessonTask(task);

            if (task) {
                if (selectedCourse) {
                    await loadStudentSubmissions(task.id, selectedCourse.id);
                } else {
                    setError('Error: Curso no seleccionado para cargar entregas de alumnos.');
                }
            } else {
                setError('No hay tarea asignada para esta lección.');
            }
        } catch (err) {
            setError('Error al cargar la tarea de la lección.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentSubmissions = async (taskId, courseId) => {
        setLoading(true);
        setError(null);
        try {
            const allUsers = await userService.getAllUsers();
            const allStudents = allUsers.filter(user => user.rol && user.rol.includes('ALUMNO'));

            const submissionsForTask = await entregaService.obtenerEntregasPorTarea(taskId);

            const studentsInCurrentCourse = allStudents.filter(student => {
                return student.cursosInscritosIds && student.cursosInscritosIds.includes(courseId);
            });

            const combinedData = studentsInCurrentCourse.map(student => {
                const submission = submissionsForTask.find(sub => sub.alumnoId === student.id);
                return {
                    studentId: student.id,
                    studentName: `${student.nombre} ${student.apellido}`,
                    studentPhoneNumber: student.telefono,
                    submission: submission || null,
                };
            });
            setStudentSubmissions(combinedData);

            console.log("Todos los usuarios:", allUsers);
            console.log("Todos los alumnos en el curso:", allStudents);
        } catch (err) {
            setError('Error al cargar las entregas de los alumnos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmission = (submissionData) => {
        setSelectedSubmissionForReview(submissionData);
        setGrade(submissionData.submission?.calificacion !== null ? submissionData.submission.calificacion : '');
        setComments(submissionData.submission?.comentariosDocente || '');
        setWhatsAppMessage('');
        setWhatsAppError(null);
        setWhatsAppSuccess(null);
        setError(null);
    };

    const handleGradeChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 20)) {
            setGrade(value);
        }
    };

    const handleCommentsChange = (e) => {
        setComments(e.target.value);
    };

    const handleWhatsAppMessageChange = (e) => {
        setWhatsAppMessage(e.target.value);
    };

    const handleSaveReview = async (e) => {
        e.preventDefault();
        if (!selectedSubmissionForReview || !lessonTask) {
            setError('No hay entrega seleccionada para guardar o tarea no definida.');
            return;
        }

        setIsSavingReview(true);
        setError(null);

        const submissionId = selectedSubmissionForReview.submission?.id;
        const calificacionNum = grade === '' ? null : parseInt(grade, 10);

        const submissionData = {
            contenido: selectedSubmissionForReview.submission?.contenido || '',
            tareaId: lessonTask.id,
            alumnoId: selectedSubmissionForReview.studentId,
            calificacion: calificacionNum,
            comentariosDocente: comments,
        };

        try {
            let resultSubmission;
            if (submissionId) {
                resultSubmission = await entregaService.actualizarEntrega(submissionId, submissionData);
                console.log('Entrega actualizada con calificación:', resultSubmission);
            } else {
                resultSubmission = await entregaService.crearEntrega(submissionData);
                console.log('Nueva entrega creada con calificación (sin contenido de alumno previo):', resultSubmission);
            }

            await loadStudentSubmissions(lessonTask.id, selectedCourse.id);
            setSelectedSubmissionForReview(prev => ({
                ...prev,
                submission: resultSubmission
            }));
            alert('Calificación y comentarios guardados exitosamente.');

        } catch (err) {
            console.error('Error al guardar la revisión:', err);
            setError(err.response?.data?.message || 'Error al guardar la revisión.');
        } finally {
            setIsSavingReview(false);
        }
    };

    const handleSendWhatsAppNotification = async () => {
        if (!selectedSubmissionForReview || !selectedCourse || !whatsAppMessage.trim()) {
            setWhatsAppError('Por favor, selecciona un alumno, un curso y escribe un mensaje para enviar.');
            return;
        }

        setIsSendingWhatsApp(true);
        setWhatsAppError(null);
        setWhatsAppSuccess(null);

        try {
            await notificationService.sendWhatsAppNotification(
                selectedSubmissionForReview.studentId,
                selectedCourse.id,
                whatsAppMessage.trim()
            );
            setWhatsAppSuccess('Mensaje de WhatsApp enviado exitosamente.');
            setWhatsAppMessage('');
        } catch (err) {
            console.error('Error al enviar mensaje de WhatsApp:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido al enviar mensaje de WhatsApp.';
            setWhatsAppError(`Error: ${errorMessage}`);
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    const isGraded = selectedSubmissionForReview && selectedSubmissionForReview.submission?.calificacion !== null;

    const showWhatsAppSection = selectedSubmissionForReview &&
                                selectedSubmissionForReview.submission &&
                                typeof selectedSubmissionForReview.submission.calificacion === 'number' &&
                                selectedSubmissionForReview.submission.calificacion < 12;

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!teacherId) {
        return <p>No se ha encontrado un ID de docente. Por favor, asegúrate de iniciar sesión como docente.</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Revisión de Tareas</h2>

            <div>
                <h4>Selecciona un Curso:</h4>
                <select onChange={(e) => handleCourseSelect(e.target.value)} value={selectedCourse?.id || ''}>
                    <option value="">-- Seleccionar Curso --</option>
                    {teacherCourses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.nombre} ({course.codigoCurso})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h3>Curso Seleccionado: {selectedCourse.nombre}</h3>

                    <h4>Selecciona una Lección:</h4>
                    {lessons.length === 0 ? (
                        <p>Este curso no tiene lecciones.</p>
                    ) : (
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
                                    onClick={() => handleLessonSelect(lesson)}
                                >
                                    {lesson.titulo}
                                </li>
                            ))}
                        </ul>
                    )}

                    {selectedLesson && (
                        <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                            <h4>Lección Seleccionada: {selectedLesson.titulo}</h4>
                            {lessonTask ? (
                                <div>
                                    <h5>Tarea: {lessonTask.titulo}</h5>
                                    <p>Descripción: {lessonTask.descripcion}</p>
                                    <p>Fecha Vencimiento: {lessonTask.fechaVencimiento ? new Date(lessonTask.fechaVencimiento).toLocaleString() : 'N/A'}</p>

                                    <hr style={{ margin: '15px 0' }} />

                                    <h4>Entregas de Alumnos para esta Tarea:</h4>
                                    {studentSubmissions.length === 0 ? (
                                        <p>No hay alumnos en este curso o no hay entregas para esta tarea.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                            <div>
                                                <h5>Alumnos:</h5>
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {studentSubmissions.map(data => (
                                                        <li
                                                            key={data.studentId}
                                                            style={{
                                                                border: '1px solid #eee',
                                                                borderRadius: '5px',
                                                                padding: '10px',
                                                                marginBottom: '10px',
                                                                cursor: 'pointer',
                                                                backgroundColor: selectedSubmissionForReview && selectedSubmissionForReview.studentId === data.studentId ? '#e6f7ff' : '#fff',
                                                                fontWeight: selectedSubmissionForReview && selectedSubmissionForReview.studentId === data.studentId ? 'bold' : 'normal',
                                                            }}
                                                            onClick={() => handleReviewSubmission(data)}
                                                        >
                                                            {data.studentName} - {data.submission ? `Entregado (${data.submission.estado})` : 'No Entregado'}
                                                            {data.submission && data.submission.calificacion !== null && ` - Calificación: ${data.submission.calificacion}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                {selectedSubmissionForReview ? (
                                                    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#f0f8ff' }}>
                                                        <h5>Revisar Entrega de: {selectedSubmissionForReview.studentName}</h5>
                                                        {selectedSubmissionForReview.submission ? (
                                                            <div>
                                                                <p><strong>Contenido Enviado:</strong> {selectedSubmissionForReview.submission.contenido}</p>
                                                                <p><strong>Fecha de Envío:</strong> {selectedSubmissionForReview.submission.fechaEnvio ? new Date(selectedSubmissionForReview.submission.fechaEnvio).toLocaleString() : 'N/A'}</p>
                                                                <p><strong>Estado:</strong> {selectedSubmissionForReview.submission.estado}</p>
                                                            </div>
                                                        ) : (
                                                            <p>Este alumno no ha enviado nada para esta tarea.</p>
                                                        )}

                                                        <form onSubmit={handleSaveReview} style={{ marginTop: '15px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                                            <div>
                                                                <label htmlFor="grade">Calificación (0-20):</label>
                                                                <input
                                                                    type="number"
                                                                    id="grade"
                                                                    value={grade}
                                                                    onChange={handleGradeChange}
                                                                    min="0"
                                                                    max="20"
                                                                    step="1"
                                                                    style={{ marginLeft: '10px', padding: '5px', width: '80px' }}
                                                                    disabled={isGraded}
                                                                />
                                                            </div>
                                                            <div style={{ marginTop: '10px' }}>
                                                                <label htmlFor="comments">Comentarios del Docente:</label>
                                                                <textarea
                                                                    id="comments"
                                                                    value={comments}
                                                                    onChange={handleCommentsChange}
                                                                    rows="4"
                                                                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                                                    disabled={isGraded}
                                                                ></textarea>
                                                            </div>
                                                            <button type="submit" disabled={isSavingReview || isGraded}>
                                                                {isSavingReview ? 'Guardando...' : 'Guardar Revisión'}
                                                            </button>
                                                        </form>

                                                        {showWhatsAppSection && (
                                                            <div style={{ marginTop: '20px', borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                                                                <h5>Enviar Notificación de WhatsApp al Alumno</h5>
                                                                <p>El alumno **{selectedSubmissionForReview.studentName}** obtuvo una calificación de **{selectedSubmissionForReview.submission.calificacion}** en esta tarea.</p>
                                                                <div style={{ marginTop: '10px' }}>
                                                                    <label htmlFor="whatsAppMessage">Mensaje personalizado:</label>
                                                                    <textarea
                                                                        id="whatsAppMessage"
                                                                        value={whatsAppMessage}
                                                                        onChange={handleWhatsAppMessageChange}
                                                                        rows="3"
                                                                        placeholder="Escribe un mensaje para el alumno (ej: 'Necesitas mejorar en este tema...')"
                                                                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                                                    ></textarea>
                                                                </div>
                                                                <button
                                                                    onClick={handleSendWhatsAppNotification}
                                                                    disabled={isSendingWhatsApp || !whatsAppMessage.trim()}
                                                                    style={{ marginTop: '10px', backgroundColor: '#25D366', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                                                >
                                                                    {isSendingWhatsApp ? 'Enviando WhatsApp...' : 'Enviar WhatsApp'}
                                                                </button>
                                                                {whatsAppError && <p style={{ color: 'red', marginTop: '5px' }}>{whatsAppError}</p>}
                                                                {whatsAppSuccess && <p style={{ color: 'green', marginTop: '5px' }}>{whatsAppSuccess}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p>Selecciona un alumno para revisar su entrega.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>No hay tarea asignada para esta lección.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskTeacher;
