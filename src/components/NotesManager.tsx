'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async (query?: string) => {
    try {
      setIsLoading(true);
      const url = query ? `/api/notes?q=${encodeURIComponent(query)}` : '/api/notes';
      
      // Log the request - VULNERABLE!
      console.log('🚨 Loading notes with query:', query);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.data.notes);
        console.log('🚨 Notes loaded, including sensitive data:', data.data.notes);
      } else {
        alert(`Error loading notes: ${data.error}`);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search without sanitization - SQL injection vulnerable!
    loadNotes(searchQuery);
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get user from localStorage - VULNERABLE!
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please login first');
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('🚨 Creating note for user:', user);
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title, // Not sanitized - XSS vulnerable!
          content, // Not sanitized - XSS vulnerable!
          ownerId: user.id,
          isPublic: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTitle('');
        setContent('');
        loadNotes(); // Reload notes
        alert('Note created successfully!');
      } else {
        alert(`Error creating note: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`Error: ${error}`);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      // No confirmation dialog - UX vulnerable!
      // No ownership check - anyone can delete!
      console.log('🚨 Deleting note:', noteId);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        loadNotes(); // Reload notes
        alert('Note deleted!');
      } else {
        alert(`Error deleting note: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-red-800">Security Vulnerabilities in this Component:</h3>
        <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
          <li>Search query vulnerable to SQL injection</li>
          <li>Note content not sanitized - XSS vulnerable when displayed</li>
          <li>No authentication checks</li>
          <li>Anyone can delete any note</li>
          <li>Sensitive data logged to console</li>
        </ul>
      </div>

      {/* Search Form - VULNERABLE */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes (try SQL injection: ' OR '1'='1)"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </form>
        <p className="text-xs text-red-600 mt-1">
          Try SQL injection: admin&apos; OR &apos;1&apos;=&apos;1
        </p>
      </div>

      {/* Create Note Form - VULNERABLE */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
        <form onSubmit={createNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Try XSS: <script>alert('XSS')</script>"
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content (also XSS vulnerable)"
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Note
          </button>
        </form>
      </div>

      {/* Notes List - VULNERABLE DISPLAY */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Notes ({notes.length})
        </h3>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-2">
                  {/* XSS VULNERABLE: Direct HTML rendering without sanitization */}
                  <h4 
                    className="text-lg font-medium"
                    dangerouslySetInnerHTML={{ __html: note.title }}
                  />
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                
                {/* XSS VULNERABLE: Direct HTML rendering */}
                <div 
                  className="text-gray-700 mb-4"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                
                <div className="text-sm text-gray-500">
                  <p>Owner: {note.owner?.email}</p>
                  <p>Password: {note.owner?.password}</p> {/* Password exposed! */}
                  <p>Created: {new Date(note.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {notes.length === 0 && !isLoading && (
              <p className="text-gray-500 text-center py-8">
                No notes found. Create one or try searching.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
