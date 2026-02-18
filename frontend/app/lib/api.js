/**
 * API client para el backend FastAPI.
 * Todas las llamadas incluyen el JWT de Supabase en el header.
 */
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Obtiene un access token fresco directamente de Supabase.
 * Evita depender del estado de React que puede estar desactualizado.
 */
async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
        throw new Error('No hay sesión activa. Inicie sesión nuevamente.');
    }
    return data.session.access_token;
}

/**
 * Realiza una predicción de severidad febril.
 * @param {Object} data - 15 variables clínicas
 * @param {string} [token] - JWT de Supabase (opcional, se obtiene automáticamente)
 */
export async function predictSeverity(data, token) {
    // Si no se pasa token, obtenerlo directamente de Supabase
    const accessToken = token || await getAccessToken();

    const res = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Error de conexión con el servidor' }));
        throw new Error(error.detail || `Error ${res.status}`);
    }

    return res.json();
}

/**
 * Obtiene la información del modelo.
 */
export async function getModelInfo() {
    const res = await fetch(`${API_URL}/api/model/info`);
    if (!res.ok) throw new Error('Error obteniendo info del modelo');
    return res.json();
}

/**
 * Obtiene las métricas del modelo.
 */
export async function getModelMetrics() {
    const res = await fetch(`${API_URL}/api/model/metrics`);
    if (!res.ok) throw new Error('Error obteniendo métricas del modelo');
    return res.json();
}

/**
 * Health check del backend.
 */
export async function healthCheck() {
    try {
        const res = await fetch(`${API_URL}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Guarda una evaluación en Supabase.
 */
export async function saveEvaluation(supabase, userId, patientData, prediction) {
    const { data, error } = await supabase.from('evaluaciones').insert([
        {
            user_id: userId,
            datos_paciente: patientData,
            prediccion: prediction.prediccion,
            prediccion_codigo: prediction.codigo,
            probabilidades: prediction.probabilidades,
            factores: prediction.factores,
            confianza: prediction.confianza,
        },
    ]).select();

    if (error) throw error;
    return data;
}

/**
 * Obtiene las evaluaciones del usuario actual.
 */
export async function getEvaluaciones(supabase, { limit = 50, offset = 0 } = {}) {
    const { data, error, count } = await supabase
        .from('evaluaciones')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
}

/**
 * Obtiene estadísticas del dashboard.
 */
export async function getDashboardStats(supabase) {
    const { data, error } = await supabase
        .from('evaluaciones')
        .select('id, prediccion, prediccion_codigo, probabilidades, factores, confianza, datos_paciente, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;

    const total = data.length;
    const leve = data.filter((e) => e.prediccion_codigo === 0).length;
    const moderada = data.filter((e) => e.prediccion_codigo === 1).length;
    const severa = data.filter((e) => e.prediccion_codigo === 2).length;

    // Confianza promedio
    const avgConfianza = total > 0
        ? (data.reduce((s, e) => s + (e.confianza || 0), 0) / total).toFixed(1)
        : 0;

    return { total, leve, moderada, severa, avgConfianza, evaluaciones: data };
}
