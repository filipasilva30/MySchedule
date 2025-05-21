import axios from 'axios';

export async function updateCaderno(directorId: string, cadernoText: string) {
  try {
    const response = await axios.patch(`http://localhost:3000/directors/${directorId}`, {
      caderno: cadernoText
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o caderno do diretor:', error);
    throw error;
  }
}
