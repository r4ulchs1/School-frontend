import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/admin/userService';
import courseService from '../../services/teacher/courseService';

function StudentCourses() {
    const [misCursos, setMisCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioActualId, setUsuarioActualId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioActual = authService.getCurrentUser();
        if (usuarioActual && usuarioActual.id && usuarioActual.roles && usuarioActual.roles.includes('ROLE_ALUMNO')) {
            setUsuarioActualId(usuarioActual.id);
        } else {
            setError('Acceso denegado. Esta página es solo para alumnos o no se pudo identificar al usuario.');
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        if (usuarioActualId) {
            cargarCursosDelAlumno();
        }
    }, [usuarioActualId]);

    const cargarCursosDelAlumno = async () => {
        setCargando(true);
        setError(null);
        try {
            const alumnoCompleto = await userService.getUserById(usuarioActualId);
            const idsCursosInscritosAlumno = new Set(alumnoCompleto.cursosInscritosIds || []);

            const todosCursos = await courseService.getAllCourses();

            const cursosFiltrados = todosCursos.filter(curso => idsCursosInscritosAlumno.has(curso.id));
            setMisCursos(cursosFiltrados);
        } catch (err) {
            setError('Error al cargar tus cursos. Asegúrate de que el backend esté funcionando y tengas cursos inscritos.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const handleVerDetalleCurso = (codigoCurso) => {
        navigate(`/student/courses/${codigoCurso}`);
    };

    if (cargando) {
        return <div>Cargando tus cursos...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!usuarioActualId) {
        return <p>No se pudo determinar el ID del alumno. Por favor, inicia sesión como alumno.</p>;
    }

    return (
        <div>
            <h2>Mis Cursos Inscritos</h2>
            {misCursos.length === 0 ? (
                <p>Actualmente no estás inscrito en ningún curso.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '20px' }}>
                    {misCursos.map(curso => (
                        <div
                            key={curso.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '15px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease-in-out',
                                backgroundColor: '#f9f9f9',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => handleVerDetalleCurso(curso.codigoCurso)}
                        >
                            <h3>{curso.nombre}</h3>
                            <p><strong>Código:</strong> {curso.codigoCurso}</p>
                            <p><strong>Descripción:</strong> {curso.descripcion}</p>
                            <p><strong>Docente:</strong> {curso.docenteNombreCompleto || 'Sin asignar'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentCourses;
