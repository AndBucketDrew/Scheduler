import { useState } from 'react';

const useForm = (defaultFormState = {}) => {
  // Lokalen State
  const [formState, setFormState] = useState(defaultFormState);

  // Input handler
  const handleFormChange = (event) => {
    // Daten aus Event rausholen
    const { name, value, files } = event.target;

    // neue physische Kopie von formState anlegen
    const newFormState = { ...formState };

    newFormState[name] = value;

    // lokalen State updaten
    setFormState(newFormState);
  };

  const updateFormField = (fieldName, fieldValue) => {
    // neue physische Kopie von formState anlegen
    const newFormState = { ...formState };

    newFormState[fieldName] = fieldValue;

    // lokalen State updaten
    setFormState(newFormState);
  };

  // returnieren: aktuellen Formulardaten als Objekt, Inputhandler
  return { formState, handleFormChange, updateFormField };
};

export default useForm;