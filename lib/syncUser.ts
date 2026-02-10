let alreadySynced = false

export const syncUserWithBackend = async (
  getToken: () => Promise<string | null>
) => {
  if (alreadySynced) {
    console.log(' User already synced, skipping')
    return
  }

  console.log('syncUserWithBackend CALLED')

  const token = await getToken() 

  if (!token) {
    console.log(' No Clerk token available')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Backend status:', res.status)

    const data = await res.json()
    console.log('Backend response:', data)

    alreadySynced = true
  } catch (err) {
    console.log('Failed to sync user with backend', err)
  }
}
