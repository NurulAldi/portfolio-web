'use client';

import { useState, useRef } from 'react';
import type { ContentBlock } from '@/lib/projects';
import ImageUploader from './ImageUploader';
import Image from 'next/image';
import { RichText } from './RichText';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

type BlockType = 'paragraph' | 'heading' | 'quote' | 'image' | 'list';

export default function BlockEditor({ blocks = [], onChange }: BlockEditorProps) {
  const [selectedType, setSelectedType] = useState<BlockType>('paragraph');
  const [editingContent, setEditingContent] = useState('');
  const [listItems, setListItems] = useState<string[]>(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure blocks is always an array
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const blockTypes = [
    { type: 'paragraph' as BlockType, label: 'Text Paragraph', icon: '📝' },
    { type: 'heading' as BlockType, label: 'Subheading', icon: 'H' },
    { type: 'quote' as BlockType, label: 'Quote', icon: '""' },
    { type: 'image' as BlockType, label: 'Content Image', icon: '🖼️' },
    { type: 'list' as BlockType, label: 'List Items', icon: '☰' },
  ];

  const insertFormat = (format: '**' | '*') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = editingContent;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = `${before}${format}${selection}${format}${after}`;
    setEditingContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + format.length,
          end + format.length
        );
      }
    }, 0);
  };

  const handleSaveBlock = () => {
    if (!editingContent.trim() && selectedType !== 'list') return;
    if (selectedType === 'list' && listItems.every(item => !item.trim())) return;

    if (editingBlockId) {
      // Update existing
      const updatedBlocks = safeBlocks.map(block => {
        if (block.id === editingBlockId) {
          return {
            ...block,
            type: selectedType,
            content: selectedType === 'list' 
              ? listItems.filter(item => item.trim()) 
              : editingContent,
          };
        }
        return block;
      });
      onChange(updatedBlocks);
      setEditingBlockId(null);
    } else {
      // Add new
      const newBlock: ContentBlock = {
        id: Date.now().toString(),
        type: selectedType,
        content: selectedType === 'list' 
          ? listItems.filter(item => item.trim()) 
          : editingContent,
      };
      onChange([...safeBlocks, newBlock]);
    }

    setEditingContent('');
    setListItems(['']);
  };

  const cancelEdit = () => {
    setEditingBlockId(null);
    setEditingContent('');
    setListItems(['']);
    setSelectedType('paragraph');
  };

  const editBlock = (block: ContentBlock) => {
    setEditingBlockId(block.id);
    setSelectedType(block.type);
    if (block.type === 'list') {
      setListItems(block.content as string[]);
      setEditingContent('');
    } else {
      setEditingContent(block.content as string);
      setListItems(['']);
    }
  };

  const removeBlock = (id: string) => {
    if (editingBlockId === id) {
      cancelEdit();
    }
    onChange(safeBlocks.filter(block => block.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...safeBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
  };

  const addListItem = () => {
    setListItems([...listItems, '']);
  };

  const removeListItem = (index: number) => {
    if (listItems.length === 1) return;
    setListItems(listItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Block Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Select Content Block Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              type="button"
              onClick={() => {
                setSelectedType(blockType.type);
                setEditingContent('');
                setListItems(['']);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === blockType.type
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-2">{blockType.icon}</div>
              <div className="text-sm font-medium text-slate-900 truncate">{blockType.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-900">
            Selected type: <span className="text-primary">{blockTypes.find(b => b.type === selectedType)?.label}</span>
          </label>
        </div>

        {selectedType === 'list' ? (
          <div className="space-y-2">
            {listItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleListItemChange(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder={`Item ${index + 1}`}
                />
                {listItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeListItem(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addListItem}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              + Add Item
            </button>
          </div>
        ) : selectedType === 'image' ? (
          <ImageUploader
            value={editingContent}
            onChange={setEditingContent}
            label=""
            required={false}
            bucketType="CONTENT_IMAGES"
          />
        ) : (
          <div className="space-y-2">
            {selectedType === 'paragraph' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => insertFormat('**')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm font-bold border border-slate-300"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('*')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm italic border border-slate-300 font-serif"
                  title="Italic"
                >
                  I
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={selectedType === 'paragraph' ? 4 : 2}
              className="input-field resize-none"
              placeholder={
                selectedType === 'paragraph' ? 'Write text paragraph here...' :
                selectedType === 'heading' ? 'Write subheading here...' :
                selectedType === 'quote' ? 'Write quote here...' :
                'Enter image URL...'
              }
            />
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleSaveBlock}
            className="btn-primary"
          >
            {editingBlockId ? 'Update Block' : '+ Add Block'}
          </button>
          {editingBlockId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Blocks List */}
      {safeBlocks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-900">
              Content Blocks ({safeBlocks.length})
            </label>
            <span className="text-xs text-slate-500">Drag and drop blocks to rearrange</span>
          </div>

          <div className="space-y-3">
            {safeBlocks.map((block, index) => (
              <div
                key={block.id}
                className="bg-white border-l-4 border-primary rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      block.type === 'paragraph' ? 'bg-blue-100 text-blue-800' :
                      block.type === 'heading' ? 'bg-purple-100 text-purple-800' :
                      block.type === 'quote' ? 'bg-amber-100 text-amber-800' :
                      block.type === 'image' ? 'bg-green-100 text-green-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {block.type === 'paragraph' ? 'Text' :
                       block.type === 'heading' ? 'Subheading' :
                       block.type === 'quote' ? 'Quote' :
                       block.type === 'image' ? 'Image' :
                       'List'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === safeBlocks.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => editBlock(block)}
                      className="p-1 text-blue-400 hover:text-blue-600 ml-2"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-700">
                  {block.type === 'list' ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(block.content as string[]).map((item, i) => (
                        <li key={i} className="truncate">{item}</li>
                      ))}
                    </ul>
                  ) : block.type === 'image' ? (
                    <div 
                      className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setImagePreview(block.content as string)}
                    >
                      <Image
                        src={block.content as string}
                        alt="Content preview"
                        fill
                        className="object-cover"
                        sizes="300px"
                        quality={80}
                      />
                    </div>
                  ) : (
                    <div className="line-clamp-2">
                      {block.type === 'paragraph' ? (
                        <RichText content={block.content as string} />
                      ) : (
                        block.content
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Blok #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full max-w-6xl max-h-screen">
              <Image
                src={imagePreview}
                alt="Full size preview"
                fill
                className="object-contain"
                sizes="(max-width: 1536px) 100vw, 1536px"
                quality={90}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
