import React, { useCallback, useEffect, useRef, useState } from 'react'
import VideoReviewComponent from './verifyVideo'

interface VideoData {
  id: string
  creatorID: string
  content: string
  coverUrl: string
  webVttUrl: string
}

interface VideoReviewListPageProps {
  accessToken: string
  currentUser: string
}

const VideoReviewListPage: React.FC<VideoReviewListPageProps> = ({
  accessToken,
  currentUser,
}) => {
  const fetchedRef = useRef(false)
  const [videos, setVideos] = useState<VideoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  let pageSize = 20

  const fetchVideoData = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const controller = new AbortController()

    try {
      setIsLoading(true)
      const response = await fetch(
        `https://admin-jimei-stg.itdog.tw/admin-api/v1/post?protectionLv=2&dateRangeType=1&reviewStatus=1&current=${currentPage}&pageSize=${pageSize}`,
        {
          headers: {
            authcat: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }

      const data = await response.json()
      setVideos(data.data || [])
      setTotalItems(data.pageResult.total || 0)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setIsLoading(false)
    }

    return () => {
      controller.abort()
    }
  }, [accessToken, currentPage])

  useEffect(() => {
    fetchVideoData()
  }, [fetchVideoData, currentPage])

  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchedRef.current = false
  }

  const formatWebVttUrl = (url: string): string => {
    const imageSpriteIndex = url.indexOf('imageSprite')
    if (imageSpriteIndex !== -1) {
      return url.substring(0, imageSpriteIndex) + 'v.f1484071.mp4'
    }
    return url // 如果沒有找到 'imageSprite'，返回原始 URL
  }

  if (isLoading) {
    return <div>Loading videos...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="sticky top-0 bg-white z-10">
        <div className="py-3 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">
            尚未审核视频总数：{totalItems}
          </h1>
          {/* 顯示目前登入帳號資訊 */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-yellow-600">
              Logged in as: {currentUser}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoReviewComponent
            key={video.id}
            accessToken={accessToken}
            webVttUrl={formatWebVttUrl(video.webVttUrl)}
            coverUrl={video.coverUrl}
            videoInfo={video.content}
            memberID={video.creatorID}
            postID={video.id}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300">
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300">
          Next
        </button>
        {/* 加入一個前往最後一頁的按鈕 */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300">
          Go to Last
        </button>
      </div>
    </div>
  )
}

export default VideoReviewListPage
