'use client';

import { useState } from 'react';
import type { ContentBlock } from '@/lib/projects';
import ImageUploader from './ImageUploader';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

type BlockType = 'paragraph' | 'heading' | 'quote' | 'image' | 'list';

export default function BlockEditor({ blocks = [], onChange }: BlockEditorProps) {
  const [selectedType, setSelectedType] = useState<BlockType>('paragraph');
  const [editingContent, setEditingContent] = useState('');
  const [listItems, setListItems] = useState<string[]>(['']);

  // Ensure blocks is always an array
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const blockTypes = [
    { type: 'paragraph' as BlockType, label: 'Paragraf Teks', icon: '📝' },
    { type: 'heading' as BlockType, label: 'Subjudul', icon: 'H' },
    { type: 'quote' as BlockType, label: 'Kutipan', icon: '""' },
    { type: 'image' as BlockType, label: 'Gambar Konten', icon: '🖼️' },
    { type: 'list' as BlockType, label: 'Daftar Item', icon: '☰' },
  ];

  const addBlock = () => {
    if (!editingContent.trim() && selectedType !== 'list') return;
    if (selectedType === 'list' && listItems.every(item => !item.trim())) return;

    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: selectedType,
      content: selectedType === 'list' 
        ? listItems.filter(item => item.trim()) 
        : editingContent,
    };

    onChange([...safeBlocks, newBlock]);
    setEditingContent('');
    setListItems(['']);
  };

  const removeBlock = (id: string) => {
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
          Pilih Jenis Blok Konten
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
              <div className="text-sm font-medium text-slate-900">{blockType.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-900">
            Jenis yang dipilih: <span className="text-primary">{blockTypes.find(b => b.type === selectedType)?.label}</span>
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
              + Tambah Item
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
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={selectedType === 'paragraph' ? 4 : 2}
            className="input-field resize-none"
            placeholder={
              selectedType === 'paragraph' ? 'Tulis paragraf teks berita di sini...' :
              selectedType === 'heading' ? 'Tulis subjudul di sini...' :
              selectedType === 'quote' ? 'Tulis kutipan di sini...' :
              'Masukkan URL gambar...'
            }
          />
        )}

        <button
          type="button"
          onClick={addBlock}
          className="mt-3 btn-primary"
        >
          + Tambah Blok
        </button>
      </div>

      {/* Blocks List */}
      {safeBlocks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-900">
              Blok Konten ({safeBlocks.length})
            </label>
            <span className="text-xs text-slate-500">Seret dan lepas blok untuk mengatur ulang</span>
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
                      {block.type === 'paragraph' ? 'Teks' :
                       block.type === 'heading' ? 'Subjudul' :
                       block.type === 'quote' ? 'Kutipan' :
                       block.type === 'image' ? 'Gambar' :
                       'Daftar'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Pindah ke atas"
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
                      title="Pindah ke bawah"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1 text-red-400 hover:text-red-600 ml-2"
                      title="Hapus"
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
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : block.type === 'image' ? (
                    <div className="text-slate-500">🖼️ {block.content}</div>
                  ) : (
                    <div className="line-clamp-2">{block.content}</div>
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
    </div>
  );
}
