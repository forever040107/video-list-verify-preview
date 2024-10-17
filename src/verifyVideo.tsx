import { useState } from 'react'

interface VideoReviewComponentProps {
  accessToken: string
  videoInfo: string
  memberID: string
  postID: string
  coverUrl: string
  webVttUrl: string
}

enum CommentPermission {
  Pending = -1,
  Rejected = 3,
  Approved = 2,
}

const VideoReviewComponent: React.FC<VideoReviewComponentProps> = ({
  accessToken,
  coverUrl,
  webVttUrl,
  videoInfo,
  memberID,
  postID,
}) => {
  const [commentPermission, setCommentPermission] = useState<CommentPermission>(
    CommentPermission.Pending
  )
  const [isLoading, setIsLoading] = useState(false)
  const [updateComplete, setUpdateComplete] = useState(false)

  const handleStatusChange = async (newStatus: number) => {
    if (!accessToken) {
      console.error('No access token available')
      return
    }

    setIsLoading(true)

    try {
      const reviewResponse = await fetch(
        'https://admin-jimei-stg.itdog.tw/admin-api/v1/post/review',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authcat: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            postIDs: [postID],
            reviewStatus: newStatus,
          }),
        }
      )

      const updateResponse = await fetch(
        'https://admin-jimei-stg.itdog.tw/admin-api/v1/post',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authcat: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            commentPermission: 1,
            content: videoInfo,
            memberID,
            postID,
            protectionLv: 1,
          }),
        }
      )

      if (!reviewResponse.ok || !updateResponse.ok) {
        throw new Error('API request failed')
      }

      setCommentPermission(newStatus)
      setUpdateComplete(true)

      console.log('Review submitted successfully')
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openVideo = () => {
    if (webVttUrl && webVttUrl != '') {
      const width = 375
      const height = 667
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2

      const playerWindow = window.open(
        '',
        'VideoPlayer',
        `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
      )

      if (playerWindow) {
        playerWindow.document.write(`
            <html>
              <head>
                <title>Video Player</title>
                <style>
                  body { margin: 0; background-color: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
                  video { max-width: 100%; max-height: 100%; }
                </style>
              </head>
              <body>
                <video 
                  src="${webVttUrl}" 
                  autoplay 
                  muted 
                  controls
                  playsinline
                >
                  Your browser does not support the video tag.
                </video>
              </body>
            </html>
          `)
        playerWindow.document.close()
      }
    } else {
      alert('No video URL available')
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case CommentPermission.Approved:
        return 'bg-green-500'
      case CommentPermission.Rejected:
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case CommentPermission.Approved:
        return '審核成功'
      case CommentPermission.Rejected:
        return '審核失敗'
      default:
        return '未審核'
    }
  }

  return (
    <div key={postID} className="w-full max-w-md mx-auto">
      <div className="p-4 space-y-4">
        <div
          className="aspect-video relative cursor-pointer"
          onClick={openVideo}
          title="Click to play video">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Video cover"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-400">No cover image</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white opacity-80"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <p className="text-sm text-gray-600">{videoInfo}</p>
        <div className="space-y-2">
          <p className="text-sm font-medium text-center mb-2">
            Current Status:{' '}
            <span
              className={`font-bold ${getStatusColor(
                commentPermission
              )} text-white px-2 py-1 rounded`}>
              {getStatusText(commentPermission)}
            </span>
          </p>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-12 bg-gray-200 rounded-full overflow-hidden flex">
              <button
                onClick={() => handleStatusChange(3)}
                disabled={updateComplete}
                className={`flex-1 text-xs font-bold transition-colors duration-300 ${
                  !isLoading && commentPermission === CommentPermission.Rejected
                    ? 'bg-red-500 text-white'
                    : 'text-gray-700'
                } ${updateComplete == false && 'hover:bg-red-200'}`}>
                拒絕
              </button>
              <button
                disabled={true}
                className={`flex-1 text-xs font-bold transition-colors duration-300 ${
                  !isLoading && commentPermission === CommentPermission.Pending
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-700'
                }`}>
                未審核
              </button>
              <button
                onClick={() => handleStatusChange(2)}
                disabled={updateComplete}
                className={`flex-1 text-xs font-bold transition-colors duration-300 ${
                  !isLoading && commentPermission === CommentPermission.Approved
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700'
                } ${updateComplete == false && 'hover:bg-green-200'}`}>
                批准
              </button>
            </div>
          </div>
        </div>
        {isLoading && (
          <p className="text-sm text-center text-gray-500">
            Submitting review...
          </p>
        )}
      </div>
    </div>
  )
}

export default VideoReviewComponent
