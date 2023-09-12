import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api.clarifai.com',
  headers: {
    "Authorization": "Key 08fc30aed8e947d492cfd50577660915"
  }
});