import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import userService from '../../services/admin/userService';
import courseService from '../../services/teacher/courseService';
import leccionService from '../../services/teacher/leccionService';
import tareaService from '../../services/teacher/tareaService';
import entregaService from '../../services/teacher/entregaService';

function NotasStudent() {
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessonsInSelectedCourse, setLessonsInSelectedCourse] = useState([]);
    const [gradesData, setGradesData] = useState([]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id && currentUser.roles && currentUser.roles.includes('ROLE_ALUMNO')) {
            setCurrentUserId(currentUser.id);
        } else {
            setError('Access denied. This page is for students only or user could not be identified.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserId) {
            loadStudentCourses();
        }
    }, [currentUserId]);

    const loadStudentCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const completeStudent = await userService.getUserById(currentUserId);
            const enrolledCourseIds = new Set(completeStudent.cursosInscritosIds || []);

            const allCourses = await courseService.getAllCourses();
            const filteredCourses = allCourses.filter(course => enrolledCourseIds.has(course.id));
            setMyCourses(filteredCourses);
        } catch (err) {
            setError('Error loading your courses. Please ensure the backend is running and you are enrolled in courses.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = async (courseId) => {
        setLoading(true);
        setError(null);
        const course = myCourses.find(c => c.id === parseInt(courseId));
        setSelectedCourse(course);
        setLessonsInSelectedCourse([]);
        setGradesData([]);

        if (course) {
            try {
                const lessons = await leccionService.obtenerLeccionesPorCurso(course.id);
                setLessonsInSelectedCourse(lessons);

                const gradesPromises = lessons.map(async (lesson) => {
                    const tasks = await tareaService.obtenerTareasPorLeccion(lesson.id);
                    const task = tasks.length > 0 ? tasks[0] : null;

                    let submission = null;
                    if (task) {
                        try {
                            submission = await entregaService.obtenerEntregaPorTareaYAlumno(task.id, currentUserId);
                        } catch (err) {
                            if (err.response && err.response.status !== 404) {
                                console.error(`Error getting submission for task ${task.id} and student ${currentUserId}:`, err);
                            }
                        }
                    }
                    return { lesson, task, submission };
                });

                const results = await Promise.all(gradesPromises);
                setGradesData(results);

            } catch (err) {
                setError('Error al cargar leccioens del curso.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Cargando tus notas...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!currentUserId) {
        return <p>Ingrese como estudiante.</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Mis notas</h2>

            <div>
                <h4>Selecciona un Curso:</h4>
                <select onChange={(e) => handleCourseSelect(e.target.value)} value={selectedCourse?.id || ''}>
                    <option value="">-- Elige un curso --</option>
                    {myCourses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.nombre} ({course.codigoCurso})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h3>Notas del Curso: {selectedCourse.nombre}</h3>

                    {lessonsInSelectedCourse.length === 0 ? (
                        <p>Este curso no tiene leccioens o tareas.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Leccion</th>
                                    <th>Tarea</th>
                                    <th>Estado</th>
                                    <th>Nota</th>
                                    <th>Comentario del Docente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gradesData.map(({ lesson, task, submission }) => (
                                    <tr key={lesson.id}>
                                        <td>{lesson.titulo}</td>
                                        <td>{task ? task.titulo : 'N/A'}</td>
                                        <td>{submission ? submission.estado : 'Not Submitted'}</td>
                                        <td>{submission?.calificacion !== null ? submission.calificacion : 'Pending'}</td>
                                        <td>{submission?.comentariosDocente || 'No comments'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotasStudent;
