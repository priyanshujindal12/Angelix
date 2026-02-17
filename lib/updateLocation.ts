

export const updateUserLocation = async (
getToken: () => Promise<string | null>,
  latitude: number,
  longitude: number
) => {
  try {
    const token = await getToken();
    if (!token) {
      console.log('No backend token')
      return
    }
    const res = await fetch('https://angelix-backend.onrender.com/api/auth/update-location', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    })

    const data = await res.json()
    console.log('Location updated:', data)

  } catch (error) {
    console.log('Location update failed:', error)
  }
}
