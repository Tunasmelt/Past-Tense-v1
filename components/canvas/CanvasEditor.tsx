'use client'

import { useState, useRef } from 'react'
import { useCanvasStore, CanvasElement } from '@/lib/stores/canvasStore'
import { LayoutMode, PageStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Image, 
  Type, 
  Square, 
  Copy, 
  Trash2, 
  ZoomIn, 
  ZoomOut,
  Smartphone,
  Monitor,
  Share2,
  Save
} from 'lucide-react'
import PublishModal from '@/components/PublishModal'

interface CanvasEditorProps {
  pageId: string
  pageTitle: string
  currentStatus: PageStatus
}

export default function CanvasEditor({ pageId, pageTitle, currentStatus }: CanvasEditorProps) {
  const {
    currentPage,
    selectedElementId,
    updatePageTitle,
    setLayoutMode,
    setBackgroundColor,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
  } = useCanvasStore()

  const [zoom, setZoom] = useState(100)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save page content and version
      await fetch(`/api/pages/${pageId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentPage?.elements }),
      })
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (status: PageStatus, scheduledTime?: Date) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          scheduledPublishAt: scheduledTime?.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish page')
      }

      setShowPublishModal(false)
    } catch (error) {
      console.error('Error publishing:', error)
    }
  }

  if (!currentPage) {
    return <div>Loading...</div>
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        const newElement: CanvasElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          x: 50,
          y: 50,
          width: 300,
          height: 300,
          rotation: 0,
          zIndex: 1,
          content: { url: imageData },
        }
        addElement(newElement)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      x: 50,
      y: 50,
      width: 300,
      height: 100,
      rotation: 0,
      zIndex: 1,
      content: 'Double click to edit',
      style: {
        fontSize: '24px',
        fontFamily: currentPage.fontFamily,
        color: '#000000',
      },
    }
    addElement(newElement)
  }

  const canvasWidth = currentPage.layoutMode === 'portrait' ? 480 : 800
  const canvasHeight = currentPage.layoutMode === 'portrait' ? 640 : 480

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b border-border bg-background p-4">
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            value={currentPage.title}
            onChange={(e) => updatePageTitle(e.target.value)}
            className="flex-1 text-lg font-semibold"
            placeholder="Untitled"
          />
          <div className="flex items-center gap-2">
            <Button
              variant={currentPage.layoutMode === 'portrait' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('portrait')}
              title="Portrait mode"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={currentPage.layoutMode === 'landscape' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayoutMode('landscape')}
              title="Landscape mode"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <div className="border-l border-border mx-2 h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              title="Save changes"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPublishModal(true)}
              title="Publish or change visibility"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Element Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Add image"
          >
            <Image className="h-4 w-4 mr-2" />
            Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddText}
            title="Add text"
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Add shape"
          >
            <Square className="h-4 w-4 mr-2" />
            Shape
          </Button>

          <div className="border-l border-border mx-2 h-6" />

          {selectedElementId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateElement(selectedElementId)}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteElement(selectedElementId)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}

          <div className="border-l border-border mx-2 h-6" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-muted/30 overflow-auto flex items-center justify-center p-8">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-2xl"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            backgroundColor: currentPage.backgroundColor,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Elements */}
          {currentPage.elements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-move ${
                selectedElementId === element.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                transform: `rotate(${element.rotation}deg)`,
                zIndex: element.zIndex,
                ...element.style,
              }}
              onClick={() => selectElement(element.id)}
              onDoubleClick={() => {
                if (element.type === 'text') {
                  const newContent = prompt('Edit text:', element.content as string)
                  if (newContent !== null) {
                    updateElement(element.id, { content: newContent })
                  }
                }
              }}
            >
              {element.type === 'image' && element.content && typeof element.content === 'object' && 'url' in element.content && (
                <img
                  src={element.content.url}
                  alt="Element"
                  className="w-full h-full object-cover"
                />
              )}
              {element.type === 'text' && (
                <div className="w-full h-full overflow-hidden text-wrap p-2">
                  {element.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElementId && currentPage.elements.find((el) => el.id === selectedElementId) && (
        <div className="border-t border-border bg-background p-4">
          <div className="text-sm text-muted-foreground">
            Selected element properties will appear here
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          pageId={pageId}
          currentStatus={currentStatus}
          currentTitle={currentPage.title}
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  )
}
