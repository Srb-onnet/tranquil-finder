'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Loader2, Volume2, VolumeX } from 'lucide-react'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations: {
    text: string;
  }[];
}

interface Nasheed {
  id: string;
  title: string;
  url: string;
}

const nasheeds: Nasheed[] = [
  { id: '1', title: 'Peaceful Melody', url: '/nasheeds/peaceful-melody.mp3' },
  { id: '2', title: 'Spiritual Journey', url: '/nasheeds/spiritual-journey.mp3' },
  { id: '3', title: 'Divine Light', url: '/nasheeds/divine-light.mp3' },
  { id: '4', title: 'Heavenly Voices', url: '/nasheeds/heavenly-voices.mp3' },
]

function removeHtmlTags(str: string): string {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Verse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentNasheed, setCurrentNasheed] = useState<Nasheed | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setResults([])

    try {
      const response = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(searchTerm)}&language=en`)
      const data = await response.json()

      if (data.search && data.search.results && data.search.results.length > 0) {
        setResults(data.search.results)
      } else {
        toast({
          title: "No results found",
          description: "Try different keywords or phrases.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching verses:', error)
      toast({
        title: "Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNasheedChange = (nasheedId: string) => {
    const selectedNasheed = nasheeds.find(n => n.id === nasheedId)
    if (selectedNasheed) {
      setCurrentNasheed(selectedNasheed)
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    if (currentNasheed && audioRef.current) {
      audioRef.current.src = currentNasheed.url
      audioRef.current.play()
    }
  }, [currentNasheed])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Tranquil Finder</h1>
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Select onValueChange={handleNasheedChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choose a nasheed" />
              </SelectTrigger>
              <SelectContent>
                {nasheeds.map((nasheed) => (
                  <SelectItem key={nasheed.id} value={nasheed.id}>
                    {nasheed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={togglePlay} variant="outline" size="icon">
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 mb-6">
            <Input 
              type="text" 
              placeholder="Enter keywords or your situation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
              aria-label="Search keywords"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          <div className="space-y-4">
            {results.map((verse) => (
              <Card key={verse.id} className="bg-white/60">
                <CardContent className="p-4">
                  <p className="text-gray-800 mb-2">{removeHtmlTags(verse.translations[0].text)}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    Quran {verse.verse_key}
                  </p>
                </CardContent>
              </Card>
            ))}
            {results.length === 0 && !isLoading && (
              <p className="text-center text-gray-600">Enter keywords above and click Search to find verses.</p>
            )}
          </div>
        </CardContent>
      </Card>
      <audio ref={audioRef} loop />
    </div>
  )
}