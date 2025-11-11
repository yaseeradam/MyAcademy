// CallDialog.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, User, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react'

export default function CallDialog({ isOpen, onClose, callType, participant }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState('connecting')
  const [stream, setStream] = useState(null)
  const intervalRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (isOpen && callStatus === 'connecting') {
      setTimeout(() => setCallStatus('connected'), 2000)
      if (callType === 'video') {
        startVideo()
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen, callStatus, callType])

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: callType === 'video', 
        audio: true 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  useEffect(() => {
    if (callStatus === 'connected') {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [callStatus])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setCallDuration(0)
    setCallStatus('connecting')
    setIsMuted(false)
    setIsVideoOff(false)
    setStream(null)
    onClose()
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleEndCall}>
      <DialogContent className="fixed inset-0 m-auto w-full max-w-2xl h-fit p-0 overflow-hidden">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
          {callType === 'video' ? (
            <div className="relative w-full h-[500px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <Avatar className="h-32 w-32">
                    {participant?.profilePicture ? (
                      <img src={participant.profilePicture} alt={participant.name} className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-5xl">
                        {participant?.name?.charAt(0).toUpperCase() || <User className="h-20 w-20" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <h3 className="text-white font-semibold">{participant?.name || 'User'}</h3>
                <p className="text-white/80 text-sm">
                  {callStatus === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
                </p>
              </div>
              <div className="absolute bottom-20 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[450px] space-y-6">
              <Avatar className="h-32 w-32 ring-4 ring-white/20">
                {participant?.profilePicture ? (
                  <img src={participant.profilePicture} alt={participant.name} className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-5xl">
                    {participant?.name?.charAt(0).toUpperCase() || <User className="h-20 w-20" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-white">{participant?.name || 'User'}</h3>
                <p className="text-white/70 text-lg mt-2">
                  {callStatus === 'connecting' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-pulse">●</span>
                      <span>Connecting...</span>
                    </span>
                  ) : (
                    formatDuration(callDuration)
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center space-x-4">
              {callType === 'video' && (
                <Button
                  variant={isVideoOff ? 'destructive' : 'secondary'}
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-lg"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg bg-red-500 hover:bg-red-600"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-7 w-7" />
              </Button>

              <Button
                variant={isSpeakerOn ? 'secondary' : 'destructive'}
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>

              {callType === 'video' && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-14 w-14 rounded-full shadow-lg"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
