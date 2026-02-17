'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientForm from '../../components/PatientForm';
import PredictionResult from '../../components/PredictionResult';
import { predictSeverity, saveEvaluation } from '../../lib/api';
import { IconCheck } from '../../components/Icons';

export default function EvaluacionPage() {
  const { session, user, supabase } = useAuth();
  const [result, setResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (data) => {
    setError('');
    setIsLoading(true);
    setSaved(false);

    try {
      const token = session?.access_token;
      const prediction = await predictSeverity(data, token);
      setResult(prediction);
      setPatientData(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor de predicción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !patientData || !user) return;
    setIsSaving(true);

    try {
      await saveEvaluation(supabase, user.id, patientData, result);
      setSaved(true);
    } catch (err) {
      console.error('Error guardando evaluación:', err);
      setError('Error al guardar la evaluación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          Evaluación de <span className="text-gradient">Paciente</span>
        </h1>
        <p>
          Ingrese los datos clínicos del paciente para obtener una predicción de
          severidad febril
        </p>
      </div>

      {error && (
        <div
          className="login-error"
          style={{ marginBottom: '1rem', maxWidth: '600px' }}
        >
          {error}
        </div>
      )}

      <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />

      {showModal && result && (
        <PredictionResult
          result={result}
          onClose={handleClose}
          onSave={saved ? null : handleSave}
          isSaving={isSaving}
        />
      )}

      {saved && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--severity-low-bg)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--severity-low)',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <IconCheck style={{ width: 16, height: 16 }} />
          Evaluación guardada exitosamente en el historial
        </div>
      )}
    </div>
  );
}
