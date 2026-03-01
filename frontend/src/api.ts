import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

export interface ConversionType {
  id: string
  name: string
  from: string[]
  to: string
}

export const api = {
  async getConversions(): Promise<ConversionType[]> {
    const response = await axios.get(`${API_BASE_URL}/conversions`)
    return response.data.conversions
  },

  async convertFile(
    conversionType: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(
      `${API_BASE_URL}/convert/${conversionType}`,
      formData,
      {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress?.(percentCompleted)
          }
        },
      }
    )

    return response.data
  },
}
