import { state } from './state.js';

const URL = 'https://localhost:8443';

export const loadData = async () => {
  const { updateUITexts } = await import('./Languages.js');
  
  try {
    const verifyResp = await fetch(URL + '/api/user/verify/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    state.authenticated = verifyResp.ok;
    
    if (!verifyResp.ok) {
      throw new Error('Authentication failed');
    }

    const dataResp = await fetch(URL + '/api/user/data/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      }
    });

    if (!dataResp.ok) {
      throw new Error('Data fetch failed');
    }

    const data = await dataResp.json();
    console.log("Data received from backend:", data);
    
    if (data) {
      state.data = {
        ...state.data,
        ...data
      };
      // Actualizar los textos de la UI cuando cambia el idioma
      updateUITexts();
    }
    
    state.error = false;
    console.log("State after update:", state);

  } catch (error) {
    console.error("Error:", error);
    state.error = true;
    state.data = null;
    localStorage.removeItem("authToken");
    location.reload();
    console.log("Removed previous authToken");
  } finally {
    state.loading = false;
  }
};

export const updateLanguage = async (language) => {
  try {
      console.log('Updating language to:', language);
      const response = await fetch(URL + '/api/user/update-language/', {
          method: 'PATCH',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language })
      });

      console.log('Language update response:', response);

      if (response.ok) {
          const data = await response.json();
          console.log('Language update successful:', data);
          state.data.language = data.language;
          return data;
      } else {
          const errorData = await response.json();
          console.error('Language update failed:', errorData);
          throw new Error('Failed to update language');
      }
  } catch (error) {
      console.error('Error updating language:', error);
      throw error;
  }
};