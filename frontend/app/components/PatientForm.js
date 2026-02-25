'use client';
import { useState } from 'react';
import { IconUsers, IconClipboard, IconHeart, IconFlask, IconLoader, IconActivity } from './Icons';

/**
 * Opciones de dropdowns — mapeo exacto a las categorías del modelo V3.
 */
const OPTIONS = {
    grupo_edad: [
        { value: 'Menor de 2', label: 'Menor de 2 años' },
        { value: '2-5', label: '2 a 5 años' },
        { value: '6-12', label: '6 a 12 años' },
        { value: '13-17', label: '13 a 17 años' },
    ],
    sexo: [
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Masculino', label: 'Masculino' },
    ],
    area: [
        { value: 'Urban', label: 'Urbana' },
        { value: 'Rural', label: 'Rural' },
    ],
    vacunacion: [
        { value: 'Completo', label: 'Completo' },
        { value: 'Incompleto', label: 'Incompleto' },
    ],
    antecedentes: [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Asma', label: 'Asma' },
        { value: 'Bronquiolitis', label: 'Bronquiolitis' },
        { value: 'Neumonía adquirida en la comunidad', label: 'Neumonía adquirida en la comunidad' },
        { value: 'Otitis media aguda', label: 'Otitis media aguda' },
        { value: 'Pretérmino', label: 'Pretérmino' },
        { value: 'Otro', label: 'Otro' },
    ],
    contacto_epidemiologico: [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Rinofaringitis', label: 'Rinofaringitis' },
        { value: 'Sinusitis', label: 'Sinusitis' },
        { value: 'Otro', label: 'Otro' },
    ],
    exposicion_ambiental: [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Polución ambiental', label: 'Polución ambiental' },
        { value: 'Polvo casero', label: 'Polvo casero' },
        { value: 'Preservativos químicos', label: 'Preservativos químicos' },
        { value: 'Tabaquismo', label: 'Tabaquismo' },
    ],
    estado_nutricional: [
        { value: 'Normal', label: 'Normal' },
        { value: 'Riesgo de desnutrición', label: 'Desnutrición' },
        { value: 'Otro', label: 'Otro (Obesidad)' },
    ],
    hallazgo_examen_fisico: [
        { value: 'Ninguno', label: 'Ninguno' },
        { value: 'Eritema orofaríngeo', label: 'Eritema orofaríngeo' },
        { value: 'Exudado purulento retrofaríngeo', label: 'Exudado purulento retrofaríngeo' },
        { value: 'Hipertrofia de amigdalas con placas purulentas', label: 'Hipertrofia de amígdalas con placas purulentas' },
        { value: 'Signos inflamatorios membrana timpánica', label: 'Signos inflamatorios membrana timpánica' },
        { value: 'Taquipnea', label: 'Taquipnea' },
        { value: 'Tirajes subcostales', label: 'Tirajes subcostales' },
        { value: 'Otro', label: 'Otro' },
    ],
};

const INITIAL_DATA = {
    grupo_edad: '2-5',
    sexo: 'Femenino',
    area: 'Urban',
    tiempo_fiebre: '',
    vacunacion: 'Completo',
    antecedentes: 'Ninguno',
    contacto_epidemiologico: 'Ninguno',
    exposicion_ambiental: 'Ninguno',
    estado_nutricional: 'Normal',
    hallazgo_examen_fisico: 'Ninguno',
    glasgow: '15',
    cayados: '',
    plaquetas: '',
    albumina: '',
    globulina: '',
    procalcitonina: '',
    leucocitos: '',
    pcr: '',
};

export default function PatientForm({ onSubmit, isLoading }) {
    const [formData, setFormData] = useState(INITIAL_DATA);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            grupo_edad: formData.grupo_edad,
            sexo: formData.sexo,
            area: formData.area,
            tiempo_fiebre: parseInt(formData.tiempo_fiebre) || 0,
            vacunacion: formData.vacunacion,
            antecedentes: formData.antecedentes,
            contacto_epidemiologico: formData.contacto_epidemiologico,
            exposicion_ambiental: formData.exposicion_ambiental,
            estado_nutricional: formData.estado_nutricional,
            hallazgo_examen_fisico: formData.hallazgo_examen_fisico,
            glasgow: parseInt(formData.glasgow),
            cayados: formData.cayados ? parseFloat(formData.cayados) : null,
            plaquetas: formData.plaquetas ? parseFloat(formData.plaquetas) : null,
            albumina: formData.albumina ? parseFloat(formData.albumina) : null,
            globulina: formData.globulina ? parseFloat(formData.globulina) : null,
            procalcitonina: formData.procalcitonina ? parseFloat(formData.procalcitonina) : null,
            leucocitos: formData.leucocitos ? parseFloat(formData.leucocitos) : null,
            pcr: formData.pcr ? parseFloat(formData.pcr) : null,
        };

        onSubmit(payload);
    };

    const handleReset = () => {
        setFormData(INITIAL_DATA);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Datos Demográficos */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconUsers style={{ width: 18, height: 18 }} /> Datos Demográficos
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Grupo de Edad</label>
                        <select className="select" name="grupo_edad" value={formData.grupo_edad} onChange={handleChange}>
                            {OPTIONS.grupo_edad.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Sexo</label>
                        <select className="select" name="sexo" value={formData.sexo} onChange={handleChange}>
                            {OPTIONS.sexo.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Área</label>
                        <select className="select" name="area" value={formData.area} onChange={handleChange}>
                            {OPTIONS.area.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Vacunación</label>
                        <select className="select" name="vacunacion" value={formData.vacunacion} onChange={handleChange}>
                            {OPTIONS.vacunacion.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Antecedentes y Exposición */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconClipboard style={{ width: 18, height: 18 }} /> Antecedentes y Exposición
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Antecedentes Personales</label>
                        <select className="select" name="antecedentes" value={formData.antecedentes} onChange={handleChange}>
                            {OPTIONS.antecedentes.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Contacto Epidemiológico</label>
                        <select className="select" name="contacto_epidemiologico" value={formData.contacto_epidemiologico} onChange={handleChange}>
                            {OPTIONS.contacto_epidemiologico.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Exposición Ambiental</label>
                        <select className="select" name="exposicion_ambiental" value={formData.exposicion_ambiental} onChange={handleChange}>
                            {OPTIONS.exposicion_ambiental.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Estado Nutricional</label>
                        <select className="select" name="estado_nutricional" value={formData.estado_nutricional} onChange={handleChange}>
                            {OPTIONS.estado_nutricional.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Evaluación Clínica */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconHeart style={{ width: 18, height: 18 }} /> Evaluación Clínica
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Días de Fiebre</label>
                        <input
                            className="input"
                            type="number"
                            name="tiempo_fiebre"
                            value={formData.tiempo_fiebre}
                            onChange={handleChange}
                            placeholder="Ej: 3"
                            min="0"
                            max="60"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Glasgow (3-15)</label>
                        <select className="select" name="glasgow" value={formData.glasgow} onChange={handleChange}>
                            {Array.from({ length: 13 }, (_, i) => 15 - i).map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Hallazgo al Examen Físico</label>
                        <select className="select" name="hallazgo_examen_fisico" value={formData.hallazgo_examen_fisico} onChange={handleChange}>
                            {OPTIONS.hallazgo_examen_fisico.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Laboratorios */}
            <div className="form-section">
                <div className="form-section-title">
                    <IconFlask style={{ width: 18, height: 18 }} /> Laboratorios
                </div>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Cayados Absolutos (cel/mm³)</label>
                        <input
                            className="input"
                            type="number"
                            name="cayados"
                            value={formData.cayados}
                            onChange={handleChange}
                            placeholder="Ej: 200"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Plaquetas (cel/mm³)</label>
                        <input
                            className="input"
                            type="number"
                            name="plaquetas"
                            value={formData.plaquetas}
                            onChange={handleChange}
                            placeholder="Ej: 250000"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Albúmina Sérica (g/dl)</label>
                        <input
                            className="input"
                            type="number"
                            name="albumina"
                            value={formData.albumina}
                            onChange={handleChange}
                            placeholder="Ej: 4.0"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Globulina Sérica (g/dl)</label>
                        <input
                            className="input"
                            type="number"
                            name="globulina"
                            value={formData.globulina}
                            onChange={handleChange}
                            placeholder="Ej: 2.5"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Procalcitonina (ng/mL)</label>
                        <input
                            className="input"
                            type="number"
                            name="procalcitonina"
                            value={formData.procalcitonina}
                            onChange={handleChange}
                            placeholder="Ej: 0.25"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Leucocitos (cel/mm³)</label>
                        <input
                            className="input"
                            type="number"
                            name="leucocitos"
                            value={formData.leucocitos}
                            onChange={handleChange}
                            placeholder="Ej: 10000"
                            min="0"
                        />
                    </div>
                    <div className="input-group">
                        <label>Proteína C Reactiva (mg/dL)</label>
                        <input
                            className="input"
                            type="number"
                            name="pcr"
                            value={formData.pcr}
                            onChange={handleChange}
                            placeholder="Ej: 5.0"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                    {isLoading ? (
                        <><IconLoader style={{ width: '1em', height: '1em' }} /> Analizando...</>
                    ) : (
                        <><IconActivity style={{ width: '1em', height: '1em' }} /> Obtener Predicción</>
                    )}
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={handleReset}>
                    Limpiar Formulario
                </button>
            </div>
        </form>
    );
}
