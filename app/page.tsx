'use client'
import { Symptom } from '@/prisma/interfaces';
import { useState, useEffect } from 'react';

export default function ExpertSystem() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch symptoms from API
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await fetch('/symptom');
        const data = await response.json();

        const symptoms = data.data as Symptom[];
        setSymptoms(symptoms);
      } catch (error) {
        console.error('Failed to fetch symptoms:', error);
      }
    };
    fetchSymptoms();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });
      const result = await response.json();
      
      setDiagnosis(result);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Toggle symptom selection
  const toggleSymptom = (id: string) => {
    const symptomId = id;

    const findSymptom = symptoms.find((symptom) => symptom.id === parseInt(symptomId));

    if (findSymptom) {
      setSelectedSymptoms((prev) =>
        prev.includes(id) ? prev.filter((symptomId) => symptomId !== id) : [...prev, findSymptom?.name]
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sistem Pakar Deteksi Diabetes
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">Pilih gejala yang Anda alami:</p>
          <p className="text-sm text-gray-500 mb-4">
            Centang semua gejala yang sesuai dengan kondisi Anda untuk mendapatkan diagnosis yang lebih akurat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {symptoms.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex items-center p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={symptom.id}
                    checked={selectedSymptoms.includes(symptom.name)}
                    onChange={() => toggleSymptom(symptom.id.toString())}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    aria-label={symptom.name}
                  />
                  <span className="ml-3 text-gray-700">{symptom.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || selectedSymptoms.length === 0}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menganalisis...
                </span>
              ) : 'Dapatkan Diagnosis'}
            </button>
            {selectedSymptoms.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Pilih minimal satu gejala untuk melanjutkan</p>
            )}
          </div>
        </form>

        {diagnosis && (
          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Hasil Diagnosis</h2>
            <div className="space-y-3">
              <p className="text-gray-800">{diagnosis.diagnosis}</p>
              <div className="flex items-center">
                <span className="text-gray-600">Tingkat kemungkinan:</span>
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                  {diagnosis.probability}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
