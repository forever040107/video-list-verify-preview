import { useEffect, useRef, useState } from 'react'
import VideoReviewListPage from './videoList.tsx'

function App() {
  const [accessToken, setAccessToken] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loginAttempted = useRef(false)

  // 新增6組帳號，在登入時，隨機使用其中一組帳號進行登入

  const accountList = [
    {
      code2FA: '222',
      password: 'abc123',
      username: 'darren',
    },
    {
      code2FA: '222',
      password: 'chihchih',
      username: 'chic',
    },
    {
      code2FA: '222',
      password: 'abc123',
      username: 'meimei',
    },
    {
      code2FA: '222',
      password: 'abc123',
      username: 'pony',
    },
    {
      code2FA: '222',
      password: '55665566',
      username: 'raychen',
    },
    {
      code2FA: '222',
      password: '55665566',
      username: 'rhys',
    },
  ]

  useEffect(() => {
    const loginUser = async () => {
      if (loginAttempted.current) return
      loginAttempted.current = true

      try {
        const randomIndex = Math.floor(Math.random() * accountList.length)
        const randomAccount = accountList[randomIndex]
        setCurrentUser(randomAccount.username)
        setIsLoading(true)
        const response = await fetch(
          'https://admin-jimei-stg.itdog.tw/admin-api/v1/user/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(randomAccount),
          }
        )

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data = await response.json()
        if (data.accessToken) {
          setAccessToken(data.accessToken)
        } else {
          throw new Error('No access token received')
        }
      } catch (error) {
        console.error('Login error:', error)
        setError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loginUser()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!accessToken) {
    return <div>Unable to authenticate. Please try again later.</div>
  }

  console.log('Logged in as:')

  return (
    <VideoReviewListPage accessToken={accessToken} currentUser={currentUser} />
  )
}

export default App
